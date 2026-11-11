import React,{useState} from 'react'

export const menu=[
 ['customers','person','Khách hàng'],['list','list','Phiếu xét nghiệm'],['cash','wallet','Thu ngân'],
 ['results','check','Kết quả'],['hema','drop','Huyết học'],['chem','lab','Hóa sinh'],
 ['reports','chart','Báo cáo'],['catalog','book','Danh mục dịch vụ']
]
export const money=n=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(n)
export const total=r=>r.rows.reduce((n,item)=>n+item.price,0)
export const groupOf=page=>({hema:'Huyết học',chem:'Hóa sinh'}[page])
const personFields=[['name','Họ và tên'],['year','Năm sinh'],['sex','Giới tính'],['phone','Điện thoại'],['address','Địa chỉ']]
export const personFrom=r=>Object.fromEntries(personFields.map(([key])=>[key,r[key]||'']))
export function GridTable({headers,rows,empty='Chưa có dữ liệu phù hợp.'}){
 return <div className="scroll"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(([key,...cells])=><tr key={key}>{cells.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length&&<p className="empty">{empty}</p>}</div>
}
export function Customers({customers,records,save,start,open}){
 const [term,search]=useState(''),[selected,select]=useState(null),[form,edit]=useState(null)
 const person=customers.find(c=>c.customerId===selected)
 if(form)return <form onSubmit={e=>{e.preventDefault();if(!form.name.trim())return;if(save({...form,name:form.name.trim()})){select(form.customerId);edit(null)}}}><section><h2>Hồ sơ khách hàng</h2><div className="grid">{personFields.map(([key,label])=><label key={key}>{label}<input required={key==='name'} value={form[key]} onChange={e=>edit({...form,[key]:e.target.value})}/></label>)}</div><div className="actions"><button type="button" onClick={()=>edit(null)}>Hủy</button><button className="primary">Lưu khách hàng</button></div></section></form>
 if(person){const visits=records.filter(r=>r.customerId===selected);return <section><div className="sectionhead"><h2>{person.name}</h2><button onClick={()=>edit(person)}>Sửa hồ sơ</button></div><p>{[person.year,person.sex,person.phone,person.address].filter(Boolean).join(' · ')}</p><h3>Lịch sử xét nghiệm</h3><GridTable headers={['Phiếu','Ngày lấy mẫu','Dịch vụ']} rows={visits.map(r=>[r.id,<button className="link" onClick={()=>open(r)}>{r.id}</button>,r.time.slice(0,10),r.rows.length])}/><div className="actions"><button onClick={()=>select(null)}>Danh sách</button><button className="primary" onClick={()=>start(person)}>Tạo phiếu cho khách</button></div></section>}
 return <section><div className="filters"><input aria-label="Tìm khách hàng" placeholder="Tên hoặc điện thoại" value={term} onChange={e=>search(e.target.value)}/><button className="primary" onClick={()=>edit({...personFrom({}),customerId:crypto.randomUUID()})}>+ Thêm khách hàng</button></div><GridTable headers={['Khách hàng','Năm sinh','Điện thoại','Lượt xét nghiệm']} rows={customers.filter(c=>(c.name+' '+c.phone).toLowerCase().includes(term.trim().toLowerCase())).map(c=>[c.customerId,<button className="link" onClick={()=>select(c.customerId)}>{c.name}</button>,c.year||'—',c.phone||'—',records.filter(r=>r.customerId===c.customerId).length])}/></section>
}
export function Catalog({services,save}){
 const [form,edit]=useState(null),[group,filter]=useState('')
 return <section><div className="filters"><select aria-label="Nhóm dịch vụ" value={group} onChange={e=>filter(e.target.value)}><option value="">Tất cả chuyên khoa</option><option>Hóa sinh</option><option>Huyết học</option></select><button className="primary" onClick={()=>edit({name:'',unit:'',group:'Hóa sinh',price:0})}>+ Thêm dịch vụ</button></div>
 {form&&<form className="editor" onSubmit={e=>{e.preventDefault();if(form.name.trim()&&form.unit.trim()&&save({...form,name:form.name.trim(),unit:form.unit.trim()}))edit(null)}}><div className="grid">{[['name','Tên dịch vụ'],['unit','Đơn vị đo'],['price','Đơn giá (đ)']].map(([key,t])=><label key={key}>{t}<input required type={key==='price'?'number':'text'} min="0" step="1" value={form[key]} onChange={e=>edit({...form,[key]:key==='price'?Number(e.target.value):e.target.value})}/></label>)}<label>Chuyên khoa<select value={form.group} onChange={e=>edit({...form,group:e.target.value})}><option>Hóa sinh</option><option>Huyết học</option></select></label></div><div className="actions"><button>Lưu dịch vụ</button><button type="button" onClick={()=>edit(null)}>Hủy</button></div></form>}
 <GridTable headers={['Dịch vụ','Chuyên khoa','Đơn vị','Đơn giá','Thao tác']} rows={services.filter(s=>!group||s.group===group).map(s=>[s.i,s.name,s.group,s.unit,money(s.price),<button onClick={()=>edit(s)}>Sửa</button>])}/></section>
}
export function Cash({records,pay}){
 const [id,select]=useState(''),[method,setMethod]=useState('Tiền mặt'),[term,search]=useState(''),[filter,setFilter]=useState('')
 const record=records.find(r=>r.id===id)
 if(record)return <section><h2>{record.payment?'Biên nhận':'Chi tiết thu phí'} · {id}</h2><p>{record.name}</p><GridTable headers={['Dịch vụ','Thành tiền']} rows={record.rows.map(r=>[r.i,r.name,money(r.price)])}/><h3>Tổng cộng · {money(total(record))}</h3>{record.payment?<p>{record.payment.method} · {new Date(record.payment.time).toLocaleString('vi-VN')}</p>:<label>Hình thức thanh toán<select value={method} onChange={e=>setMethod(e.target.value)}><option>Tiền mặt</option><option>Chuyển khoản</option></select></label>}<div className="actions"><button onClick={()=>select('')}>Quay lại</button>{record.payment?<button onClick={()=>window.print()}>In biên nhận</button>:<button className="primary" onClick={()=>pay(id,method)}>Xác nhận đã thu {money(total(record))}</button>}</div></section>
 return <section><div className="filters"><input placeholder="Tìm mã phiếu hoặc khách hàng" aria-label="Tìm khoản thu" value={term} onChange={e=>search(e.target.value)}/><select aria-label="Trạng thái thu" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">Tất cả khoản thu</option><option value="due">Chưa thu</option><option value="paid">Đã thu</option></select></div><GridTable headers={['Mã phiếu','Khách hàng','Tổng phí','Trạng thái','Thao tác']} rows={records.filter(r=>(!filter||Boolean(r.payment)===(filter==='paid'))&&(r.id+' '+r.name).toLowerCase().includes(term.trim().toLowerCase())).map(r=>[r.id,r.id,r.name,money(total(r)),r.payment?'Đã thu':'Chưa thu',<button onClick={()=>select(r.id)}>{r.payment?'Biên nhận':'Thu tiền'}</button>])}/></section>
}
export function Reports({records,today}){
 const [from,setFrom]=useState(today.slice(0,8)+'01'),[to,setTo]=useState(today)
 const within=t=>(!from||t.slice(0,10)>=from)&&(!to||t.slice(0,10)<=to)
 const visits=records.filter(r=>within(r.time)),payments=records.filter(r=>r.payment&&within(r.payment.time))
 return <><section><div className="filters period"><label>Từ ngày<input type="date" max={to} value={from} onChange={e=>setFrom(e.target.value)}/></label><label>Đến ngày<input type="date" min={from} value={to} onChange={e=>setTo(e.target.value)}/></label></div></section><div className="summary">{[['Phiếu lấy mẫu',visits.length],['Phiếu hoàn tất',visits.filter(r=>r.status===2).length],['Thực thu trong kỳ',money(payments.reduce((n,r)=>n+r.payment.amount,0))]].map(([t,v])=><section key={t}><small>{t}</small><h2>{v}</h2></section>)}</div><section><h2>Khối lượng theo chuyên khoa</h2><GridTable headers={['Chuyên khoa','Số phiếu','Số chỉ số','Đã nhập kết quả']} rows={['Hóa sinh','Huyết học'].map(g=>{const rows=visits.flatMap(r=>r.rows).filter(r=>r.group===g);return [g,g,visits.filter(r=>r.rows.some(x=>x.group===g)).length,rows.length,rows.filter(r=>r.value.trim()).length]})}/></section><section><h2>Khoản thu trong kỳ</h2><GridTable headers={['Mã phiếu','Ngày thu','Hình thức','Thực thu']} rows={payments.map(r=>[r.id,r.id,new Date(r.payment.time).toLocaleDateString('vi-VN'),r.payment.method,money(r.payment.amount)])}/></section></>
}
