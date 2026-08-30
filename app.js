import {db} from "../firebase.js";
import {collection,addDoc,getDocs,doc,updateDoc,deleteDoc,serverTimestamp,query,orderBy} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const $=id=>document.getElementById(id), form=$("productForm"), list=$("products");
let all=[];

function toast(t){const x=$("toast");x.textContent=t;x.style.display="block";setTimeout(()=>x.style.display="none",2200)}
function money(n){return new Intl.NumberFormat("ar-EG",{style:"currency",currency:"EGP",maximumFractionDigits:0}).format(Number(n)||0)}
function render(){
 const term=$("search").value.trim().toLowerCase();
 const arr=all.filter(p=>(p.name||"").toLowerCase().includes(term)||(p.category||"").toLowerCase().includes(term));
 list.innerHTML=arr.map(p=>`<article class="card">
 <div class="pic">${p.imageUrl?`<img src="${escapeHtml(p.imageUrl)}" alt="">`:`<span class="noimg">بدون صورة</span>`}</div>
 <div class="cardbody"><h3>${escapeHtml(p.name||"بدون اسم")}</h3><div class="meta">${escapeHtml(p.category||"بدون تصنيف")}</div>
 <div class="price">${money(p.price)}</div><div class="stock ${Number(p.quantity)>0?"ok":"out"}">${Number(p.quantity)>0?`متوفر: ${p.quantity}`:"غير متوفر"}</div>
 <div class="card-actions"><button class="edit" data-edit="${p.id}">تعديل</button><button class="delete" data-delete="${p.id}">حذف</button></div></div></article>`).join("")||"<p>لا توجد منتجات.</p>";
 $("count").textContent=all.length;$("available").textContent=all.filter(p=>Number(p.quantity)>0).length;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
async function load(){
 const snap=await getDocs(query(collection(db,"products"),orderBy("createdAt","desc")));
 all=snap.docs.map(d=>({id:d.id,...d.data()}));render();
}
form.addEventListener("submit",async e=>{
 e.preventDefault();
 const data={name:$("name").value.trim(),price:Number($("price").value),quantity:Number($("quantity").value),category:$("category").value.trim(),description:$("description").value.trim(),imageUrl:$("imageUrl").value.trim(),updatedAt:serverTimestamp()};
 const id=$("editId").value;
 try{if(id){await updateDoc(doc(db,"products",id),data);toast("تم تعديل المنتج")}else{await addDoc(collection(db,"products"),{...data,createdAt:serverTimestamp()});toast("تمت إضافة المنتج")}reset();await load()}catch(err){console.error(err);toast("حصل خطأ. تأكد من إعداد Firestore وقواعده.")}
});
function reset(){$("editId").value="";form.reset();$("saveBtn").textContent="إضافة المنتج";$("cancelBtn").hidden=true}
$("cancelBtn").onclick=reset;
$("search").oninput=render;
list.onclick=async e=>{
 const edit=e.target.closest("[data-edit]"), del=e.target.closest("[data-delete]");
 if(edit){const p=all.find(x=>x.id===edit.dataset.edit);$("editId").value=p.id;$("name").value=p.name||"";$("price").value=p.price??"";$("quantity").value=p.quantity??0;$("category").value=p.category||"";$("description").value=p.description||"";$("imageUrl").value=p.imageUrl||"";$("saveBtn").textContent="حفظ التعديل";$("cancelBtn").hidden=false;scrollTo({top:0,behavior:"smooth"})}
 if(del&&confirm("هل تريد حذف المنتج؟")){await deleteDoc(doc(db,"products",del.dataset.delete));toast("تم حذف المنتج");await load()}
};
load().catch(e=>{console.error(e);toast("فعّل Firestore أولًا ثم أعد فتح الصفحة")});
