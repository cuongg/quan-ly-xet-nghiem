const {spawnSync}=require('node:child_process')
const {randomBytes}=require('node:crypto')
const fs=require('node:fs')
const path=require('node:path')
const {Client}=require('pg')

const dir=path.join(process.env.LOCALAPPDATA,'LamLab')
const bin=process.env.LIS_PG_BIN || path.join(process.env.ProgramFiles,'PostgreSQL','16','bin')
const cluster=path.join(dir,'postgres')
const settings=path.join(dir,'server.json')
const password=()=>randomBytes(32).toString('hex')

function run(name,args,input){
  const result=spawnSync(path.join(bin,name+'.exe'),args,{encoding:'utf8',input,windowsHide:true,stdio:name==='pg_ctl'?'ignore':'pipe'})
  if(result.error)throw result.error
  if(result.status!==0)throw new Error(result.stderr||result.stdout||name+' failed')
}

async function prepare(){
  fs.mkdirSync(dir,{recursive:true})
  if(!fs.existsSync(settings)){
    fs.writeFileSync(settings,JSON.stringify({admin:password(),databasePassword:password(),apiToken:password()},null,2),{flag:'wx'})
  }
  const keys=JSON.parse(fs.readFileSync(settings,'utf8'))
  if(!fs.existsSync(path.join(cluster,'PG_VERSION'))){
    const pwfile=path.join(dir,'init-'+randomBytes(12).toString('hex'))
    fs.writeFileSync(pwfile,keys.admin+'\n',{flag:'wx',mode:0o600})
    try{
      run('initdb',['-D',cluster,'-U','lamlab_admin','--encoding=UTF8','--locale=C','--auth=scram-sha-256','--pwfile='+pwfile])
    }finally{fs.unlinkSync(pwfile)}
    fs.appendFileSync(path.join(cluster,'postgresql.conf'),"\nlisten_addresses = '127.0.0.1'\nport = 55432\n")
  }
  const status=spawnSync(path.join(bin,'pg_ctl.exe'),['-D',cluster,'status'],{windowsHide:true})
  if(status.status!==0)run('pg_ctl',['-D',cluster,'-l',path.join(dir,'postgres.log'),'-w','start'])
  const admin=new Client({host:'127.0.0.1',port:55432,user:'lamlab_admin',database:'postgres',password:keys.admin})
  await admin.connect()
  try{
    if(!(await admin.query("SELECT 1 FROM pg_roles WHERE rolname='lamlab'")).rowCount){
      const {rows}=await admin.query("SELECT format('CREATE ROLE lamlab LOGIN PASSWORD %L',$1::text) AS sql",[keys.databasePassword])
      await admin.query(rows[0].sql)
    }
    if(!(await admin.query("SELECT 1 FROM pg_database WHERE datname='lamlab'")).rowCount){
      await admin.query('CREATE DATABASE lamlab OWNER lamlab')
    }
  }finally{await admin.end()}
}
prepare().catch(error=>{console.error(error.message);process.exitCode=1})
