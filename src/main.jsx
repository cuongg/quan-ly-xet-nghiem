import React, {useState} from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import {menu, GridTable, Customers, Cash, Reports, Catalog, personFrom, total, groupOf} from './workspace.jsx'

const tests = [['Glucose','mmol/L'],['Cholesterol','mmol/L'],['Triglyceride','mmol/L'],['HDL-Cholesterol','mmol/L'],['LDL-Cholesterol','mmol/L'],['AST (GOT)','U/L'],['ALT (GPT)','U/L'],['GGT','U/L'],['Ure','mmol/L'],['Creatinine','µmol/L'],['Acid uric','µmol/L'],['Amylase','U/L'],['Canxi toàn phần','mmol/L'],['Protein toàn phần','g/L'],['Albumin','g/L'],['Bilirubin toàn phần','µmol/L'],['Bilirubin trực tiếp','µmol/L']]
const stages=['Chờ xử lý','Đang xét nghiệm','Hoàn tất']
const icons={lab:'M9 3h6m-5 0v6L4 19q-1 2 2 2h12q3 0 2-2l-6-10V3M7 15h10',list:'M4 4h16v16H4zM8 9h8M8 14h6',book:'M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14',clock:'M12 3a9 9 0 1 0 .01 0M12 7v5l3 2',check:'M4 12l5 5L20 6',search:'M16 16l5 5M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',plus:'M12 5v14M5 12h14',arrow:'M8 12h9m-4-4 4 4-4 4'}
function Icon({name}){return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={icons[name]}/></svg>}
const names=['Lê Minh Anh','Nguyễn Hoàng Nam','Trần Thu Hà','Phạm Gia Bảo','Vũ Thanh Mai','Đỗ Hải Yến','Hoàng Đức Huy','Ngô Bảo Ngọc']
const localTime=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
const fresh=()=>({name:'',year:'',sex:'',doctor:'',address:'',phone:'',diagnosis:'',note:'',sample:'Huyết thanh',time:localTime(),received:'',status:0,rows:[]})
const row=i=>({i,value:'',ref:'',flag:''})
const seed=()=>names.map((name,i)=>({...fresh(),id:'XN-'+String(108-i).padStart(4,'0'),name,year:1980+i,sex:i%2?'Nam':'Nữ',status:i%3,time:localTime().slice(0,10)+'T'+['10:42','10:28','10:15','09:56','09:41','09:20','09:05','08:52'][i],rows:[0,1,2].map(j=>({...row(j),value:i%3===2?String([5,4,1][j]):''}))}))
const key='lamlab-records-v1'
const format=t=>t?new Date(t).toLocaleString('vi-VN',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}):'—'
function Pill({s}){return <span className={'pill p'+s}><b>●</b>{stages[s]}</span>}
const storageKey='lamlab-workspace-v2'
function loadWorkspace(){
 const version=localStorage.getItem(storageKey)
 if(version)return {...JSON.parse(version),version}
 const blood=[['Bạch cầu (WBC)','G/L'],['Hồng cầu (RBC)','T/L'],['Hemoglobin (HGB)','g/L'],['Hematocrit (HCT)','%'],['Tiểu cầu (PLT)','G/L']]
 const services=[...tests,...blood].map(([name,unit],i)=>({i,name,unit,group:i<tests.length?'Hóa sinh':'Huyết học',price:i<tests.length?35000:20000}))
 const saved=localStorage.getItem(key)
 const source=saved?JSON.parse(saved):seed()
 const records=source.map((r,n)=>({...r,customerId:'KH-'+r.id,sample:!saved&&n%3===1?'Máu toàn phần':r.sample,rows:r.rows.map(x=>({...x,...services[!saved&&n%3===1?tests.length+x.i:x.i]}))}))
 return {records,services,customers:records.map(r=>({...personFrom(r),customerId:r.customerId})),version:null}
}
Object.assign(icons,{person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-2a8 8 0 0 1 16 0v2',wallet:'M3 6h18v14H3zM3 6l13-4v4M16 11h5v4h-5z',drop:'M12 2S5 10 5 15a7 7 0 0 0 14 0c0-5-7-13-7-13z',chart:'M3 3v18h18M7 17v-5m5 5V7m5 10V9'})
function App(){
 const [db,setDb]=useState(loadWorkspace)
 const {records,services,customers}=db
 const [page,go]=useState('list'),[draft,edit]=useState(null),[q,search]=useState(''),[filter,select]=useState(-1),[message,notify]=useState('')
 function persist(next){
   try{
     if(localStorage.getItem(storageKey)!==db.version){notify('Dữ liệu đã thay đổi ở cửa sổ khác. Hãy tải lại trang trước khi lưu.');return false}
     const {version,...data}=next
     const serialized=JSON.stringify(data)
     localStorage.setItem(storageKey,serialized)
     setDb({...data,version:serialized})
     return true
   }catch{notify('Trình duyệt không lưu được dữ liệu. Hãy giữ màn hình hiện tại.');return false}
 }
 const field=(k,v)=>edit({...draft,[k]:v})
 const navigate=p=>{go(p);edit(null);notify('');search('');select(-1)}
 const open=r=>{edit(r);notify('')}
 function saveCustomer(c){return persist({...db,customers:[...customers.filter(x=>x.customerId!==c.customerId),c]})}
 function saveService(s){
   if(services.some(x=>x.i!==s.i&&x.name.toLowerCase()===s.name.toLowerCase()&&x.group===s.group)){notify('Tên dịch vụ đã tồn tại trong chuyên khoa.');return false}
   return persist({...db,services:s.i===undefined?[...services,{...s,i:services.length}]:services.map(x=>x.i===s.i?s:x)})
 }
 function pay(id,method){const r=records.find(x=>x.id===id);if(r&&!r.payment)persist({...db,records:records.map(x=>x.id===id?{...x,payment:{time:localTime(),method,amount:total(x)}}:x)})}
 function save(e){e.preventDefault();if(!draft.name.trim()||!draft.rows.length)return notify('Vui lòng nhập họ tên và chọn ít nhất một xét nghiệm.')
 if(draft.status===2&&draft.rows.some(r=>!r.value.trim()))return notify('Cần nhập đủ kết quả trước khi hoàn tất.')
 const item={...draft,name:draft.name.trim(),id:draft.id||'XN-'+String(Math.max(0,...records.map(r=>Number(r.id.slice(3))))+1).padStart(4,'0')}
 const next=draft.id?records.map(r=>r.id===item.id?item:r):[item,...records]
 item.customerId=draft.customerId||crypto.randomUUID()
 const people=customers.some(c=>c.customerId===item.customerId)?customers:[...customers,{...personFrom(item),customerId:item.customerId}]
 if(!persist({...db,records:next,customers:people}))return
 navigate(['hema','chem','results'].includes(page)?page:'list');notify('Đã lưu phiếu '+item.id)}
 const normalize=s=>s.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu,'').replaceAll('đ','d')
 const shown=records.filter(r=>(!groupOf(page)||r.rows.some(x=>x.group===groupOf(page)))&&(filter<0||r.status===filter)&&normalize(r.name+' '+r.id).includes(normalize(q.trim())))
 const title=draft?(draft.id||'Tạo phiếu xét nghiệm'):menu.find(([p])=>p===page)[2]
 return <><aside><div className="brand"><i><Icon name="lab"/></i>LamLab</div><small>KHÔNG GIAN LÀM VIỆC</small>{menu.map(([p,ic,t])=><button key={p} className={page===p?'active':''} onClick={()=>navigate(p)}><Icon name={ic}/>{t}</button>)}<footer><span className="avatar">KT</span><div><strong>Kỹ thuật viên</strong><small>Không gian demo</small></div></footer></aside>
 <main><header>Phòng xét nghiệm <span>/</span> <strong>{title}</strong></header><article><div className="intro"><div><small className="eyebrow">QUẢN LÝ XÉT NGHIỆM</small><h1>{title}</h1><p>{draft?'Thông tin tiếp nhận và kết quả xét nghiệm.':({list:'Tiếp nhận mẫu và theo dõi tiến độ từng phiếu.',customers:'Thông tin liên hệ và lịch sử xét nghiệm.',cash:'Thu phí dịch vụ và in biên nhận theo phiếu.',reports:'Tổng hợp hoạt động xét nghiệm và khoản thu theo kỳ.',results:'Tra cứu, hoàn tất và in kết quả theo phiếu.',hema:'Danh sách mẫu có chỉ định huyết học.',chem:'Danh sách mẫu có chỉ định hóa sinh.',catalog:'Quản lý chuyên khoa, đơn vị đo và giá dịch vụ.'})[page]}</p></div>{!draft&&page==='list'&&<button className="primary" onClick={()=>{edit(fresh());notify('')}}><Icon name="plus"/>Tạo phiếu mới</button>}</div>
 {message&&<p role="status">{message}</p>}
 {draft?<form onSubmit={save}><section><h2>Thông tin tiếp nhận</h2>{!draft.id&&<label className="picker">Chọn khách hàng<select value={draft.customerId||''} onChange={e=>{const c=customers.find(c=>c.customerId===e.target.value);edit({...draft,...personFrom(c||{}),customerId:c?.customerId})}}><option value="">Khách hàng mới</option>{customers.map(c=><option key={c.customerId} value={c.customerId}>{c.name} · {c.phone||c.year}</option>)}</select></label>}<div className="grid">{[['name','Họ và tên'],['year','Năm sinh','number'],['sex','Giới tính'],['phone','Số điện thoại'],['address','Địa chỉ'],['doctor','Bác sĩ chỉ định'],['diagnosis','Chẩn đoán'],['sample','Loại mẫu'],['time','Thời gian lấy mẫu','datetime-local'],['received','Thời gian nhận mẫu','datetime-local'],['note','Ghi chú']].map(([k,t,type])=><label key={k}>{t}<input required={['name','sample','time'].includes(k)} type={type||'text'} value={draft[k]} onChange={e=>field(k,e.target.value)}/></label>)}</div></section>
 <section><h2>Kết quả xét nghiệm</h2><select disabled={Boolean(draft.payment)} aria-label="Thêm dịch vụ" value="" onChange={e=>field('rows',[...draft.rows,{...row(Number(e.target.value)),...services[Number(e.target.value)]}])}><option value="" disabled>+ Thêm dịch vụ xét nghiệm</option>{services.map(({name:t,i,group})=>!draft.rows.some(r=>r.i===i)&&<option key={t} value={i}>{group} · {t}</option>)}</select>{draft.rows.map((r,n)=><div className="result" key={r.i}><strong>{r.name} · {r.unit}</strong>{[['value','Kết quả'],['ref','Khoảng tham chiếu'],['flag','Ghi chú']].map(([k,t])=><label key={k}>{t}<input value={r[k]} onChange={e=>field('rows',draft.rows.map((a,b)=>b===n?{...a,[k]:e.target.value}:a))}/></label>)}<button disabled={Boolean(draft.payment)} type="button" onClick={()=>field('rows',draft.rows.filter(a=>a.i!==r.i))}>Bỏ</button></div>)}</section><label>Trạng thái<select value={draft.status} onChange={e=>field('status',Number(e.target.value))}>{stages.map((s,i)=><option key={s} value={i}>{s}</option>)}</select></label><div className="actions"><button type="button" onClick={()=>navigate(page)}>Quay lại</button>{draft.id&&<button type="button" onClick={()=>window.print()}>In phiếu hiện tại</button>}<button className="primary">Lưu phiếu</button></div></form>:page==='customers'?<Customers customers={customers} records={records} save={saveCustomer} open={r=>{navigate('list');open(r)}} start={c=>{navigate('list');edit({...fresh(),...c})}}/>:
 page==='catalog'?<Catalog services={services} save={saveService}/>:
 page==='cash'?<Cash records={records} pay={pay}/>:
 page==='reports'?<Reports records={records} today={localTime().slice(0,10)}/>:<>
 {page==='list'&&<div className="stats">{['Tổng số phiếu',...stages].map((s,i)=><button key={s} onClick={()=>select(i-1)}><div className={'badge b'+i}><Icon name={['list','clock','lab','check'][i]}/></div><div><small>{s}</small><strong>{i?records.filter(r=>r.status===i-1).length:records.length}</strong></div></button>)}</div>}
 <section className="list"><div className="sectionhead"><h2>{page==='results'?'Sổ kết quả':groupOf(page)?'Phiếu '+groupOf(page).toLowerCase():'Danh sách phiếu'}</h2><span>{shown.length} phiếu</span></div><div className="filters"><div className="search"><Icon name="search"/><input aria-label="Tìm phiếu" placeholder="Tìm theo mã phiếu, tên bệnh nhân..." value={q} onChange={e=>search(e.target.value)}/></div><select aria-label="Lọc trạng thái" value={filter} onChange={e=>select(Number(e.target.value))}><option value="-1">Tất cả trạng thái</option>{stages.map((s,i)=><option key={s} value={i}>{s}</option>)}</select></div>
 {page==='list'?<GridTable headers={['Mã phiếu','Bệnh nhân','Loại mẫu','Thời gian lấy mẫu','Trạng thái','Thao tác']} rows={shown.map(r=>[r.id,r.id,<strong>{r.name}</strong>,r.sample,format(r.time),<Pill s={r.status}/>,<button onClick={()=>open(r)}>Mở phiếu</button>])}/>:
 <GridTable headers={['Phiếu / Khách hàng','Xét nghiệm','Kết quả','Khoảng tham chiếu','Ghi chú','Thao tác']} rows={shown.flatMap(r=>r.rows.filter(x=>!groupOf(page)||x.group===groupOf(page)).map(x=>[r.id+'-'+x.i,<><strong>{r.name}</strong><small>{r.id}</small></>,x.name,x.value?x.value+' '+x.unit:'Chờ kết quả',x.ref||'—',x.flag||'—',<button onClick={()=>open(r)}>{r.status===2?'Xem phiếu':'Nhập kết quả'}</button>]))}/>}</section></>}</article></main></>
}
createRoot(document.getElementById('root')).render(<App/>)
