import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "./firebase.js";


// ===============================
// عناصر الصفحة
// ===============================

const form = document.querySelector("#productForm");

const nameInput =
  document.querySelector("#name") ||
  document.querySelector("#productName") ||
  document.querySelector("#product-name");

const priceInput =
  document.querySelector("#price") ||
  document.querySelector("#productPrice") ||
  document.querySelector("#product-price");

const quantityInput =
  document.querySelector("#quantity") ||
  document.querySelector("#qty") ||
  document.querySelector("#productQuantity");

const categoryInput =
  document.querySelector("#category") ||
  document.querySelector("#productCategory");

const descriptionInput =
  document.querySelector("#description") ||
  document.querySelector("#productDescription");

const imageInput =
  document.querySelector("#image") ||
  document.querySelector("#imageUrl") ||
  document.querySelector("#productImage");

const productsContainer =
  document.querySelector("#products") ||
  document.querySelector("#productList") ||
  document.querySelector("#list");

const saveButton =
  document.querySelector("#saveBtn") ||
  document.querySelector("#addProduct");

const cancelButton =
  document.querySelector("#cancelBtn");

const searchInput =
  document.querySelector("#search");


// ===============================
// المتغيرات
// ===============================

let products = [];

let editingId = null;


// ===============================
// رسالة
// ===============================

function toast(message) {

  let box = document.querySelector("#toast");

  if (!box) {

    box = document.createElement("div");

    box.id = "toast";

    box.style.position = "fixed";
    box.style.bottom = "25px";
    box.style.left = "50%";
    box.style.transform = "translateX(-50%)";
    box.style.padding = "14px 22px";
    box.style.background = "#111827";
    box.style.color = "white";
    box.style.borderRadius = "12px";
    box.style.zIndex = "99999";
    box.style.fontSize = "15px";
    box.style.boxShadow = "0 10px 30px rgba(0,0,0,.25)";

    document.body.appendChild(box);
  }

  box.textContent = message;

  box.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    box.style.display = "none";

  }, 3000);
}


// ===============================
// حماية HTML
// ===============================

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ===============================
// تحميل المنتجات
// ===============================

async function loadProducts() {

  if (!productsContainer) {
    console.error("لم يتم العثور على عنصر عرض المنتجات");
    return;
  }

  productsContainer.innerHTML = `
    <div style="
      text-align:center;
      padding:30px;
      color:#667085;
    ">
      جاري تحميل المنتجات...
    </div>
  `;

  try {

    const snapshot =
      await getDocs(collection(db, "products"));

    products = snapshot.docs.map(item => ({

      id: item.id,

      ...item.data()

    }));

    products.sort((a, b) => {

      const aTime =
        a.createdAt?.seconds || 0;

      const bTime =
        b.createdAt?.seconds || 0;

      return bTime - aTime;

    });

    renderProducts();

  } catch (error) {

    console.error(error);

    productsContainer.innerHTML = `
      <div style="
        background:#fff1f2;
        color:#be123c;
        padding:20px;
        border-radius:15px;
        text-align:center;
      ">

        <h3>حدث خطأ في تحميل المنتجات</h3>

        <p>${escapeHTML(error.code || "")}</p>

        <small>
          ${escapeHTML(error.message || "")}
        </small>

      </div>
    `;

    toast("فشل الاتصال بـ Firebase");

  }
}


// ===============================
// عرض المنتجات
// ===============================

function renderProducts() {

  if (!productsContainer) return;

  const search =
    searchInput?.value?.trim().toLowerCase() || "";

  const filtered = products.filter(product => {

    const name =
      String(product.name || "").toLowerCase();

    const category =
      String(product.category || "").toLowerCase();

    return (
      name.includes(search) ||
      category.includes(search)
    );

  });


  if (filtered.length === 0) {

    productsContainer.innerHTML = `
      <div style="
        text-align:center;
        padding:40px;
        color:#667085;
      ">

        لا توجد منتجات حالياً

      </div>
    `;

    return;
  }


  productsContainer.innerHTML = filtered.map(product => {

    const image = product.image || "";

    return `

      <div class="product-card"
        data-id="${escapeHTML(product.id)}"
        style="
          background:white;
          border-radius:18px;
          padding:18px;
          margin-bottom:15px;
          box-shadow:0 5px 20px rgba(0,0,0,.07);
        ">

        ${
          image
          ?
          `
          <img
            src="${escapeHTML(image)}"
            style="
              width:100%;
              max-width:180px;
              height:150px;
              object-fit:contain;
              display:block;
              margin:auto;
              border-radius:12px;
            "
            onerror="this.style.display='none'"
          >
          `
          :
          ""
        }


        <h3>
          ${escapeHTML(product.name || "بدون اسم")}
        </h3>


        <p>
          السعر:
          <strong>
            ${Number(product.price || 0).toLocaleString("ar-EG")}
          </strong>
          جنيه
        </p>


        <p>
          الكمية:
          <strong>
            ${escapeHTML(product.quantity ?? 0)}
          </strong>
        </p>


        ${
          product.category
          ?
          `
          <p>
            التصنيف:
            ${escapeHTML(product.category)}
          </p>
          `
          :
          ""
        }


        ${
          product.description
          ?
          `
          <p>
            ${escapeHTML(product.description)}
          </p>
          `
          :
          ""
        }


        <div
          style="
            display:flex;
            gap:10px;
            margin-top:15px;
          "
        >

          <button
            type="button"
            class="edit-product"
            data-id="${escapeHTML(product.id)}"
          >
            تعديل
          </button>


          <button
            type="button"
            class="delete-product"
            data-id="${escapeHTML(product.id)}"
          >
            حذف
          </button>

        </div>

      </div>

    `;

  }).join("");


  // أزرار التعديل

  document.querySelectorAll(".edit-product")
    .forEach(button => {

      button.addEventListener("click", () => {

        editProduct(button.dataset.id);

      });

    });


  // أزرار الحذف

  document.querySelectorAll(".delete-product")
    .forEach(button => {

      button.addEventListener("click", () => {

        deleteProduct(button.dataset.id);

      });

    });

}


// ===============================
// إضافة / تعديل المنتج
// ===============================

if (form) {

  form.addEventListener("submit", async event => {

    event.preventDefault();


    const name =
      nameInput?.value?.trim() || "";

    const price =
      Number(priceInput?.value || 0);

    const quantity =
      Number(quantityInput?.value || 0);

    const category =
      categoryInput?.value?.trim() || "";

    const description =
      descriptionInput?.value?.trim() || "";

    const image =
      imageInput?.value?.trim() || "";


    if (!name) {

      toast("اكتب اسم المنتج");

      nameInput?.focus();

      return;
    }


    if (price < 0) {

      toast("السعر غير صحيح");

      return;
    }


    if (quantity < 0) {

      toast("الكمية غير صحيحة");

      return;
    }


    const data = {

      name,

      price,

      quantity,

      category,

      description,

      image,

      updatedAt: serverTimestamp()

    };


    try {

      if (editingId) {

        await updateDoc(

          doc(db, "products", editingId),

          data

        );

        toast("تم تعديل المنتج بنجاح ✓");

      }

      else {

        await addDoc(

          collection(db, "products"),

          {

            ...data,

            createdAt: serverTimestamp()

          }

        );

        toast("تمت إضافة المنتج بنجاح ✓");

      }


      resetForm();

      await loadProducts();


    } catch (error) {

      console.error(
        "Firebase Error:",
        error
      );


      if (
        error.code ===
        "permission-denied"
      ) {

        toast(
          "Firebase رفض العملية - راجع Rules"
        );

      }

      else {

        toast(
          "خطأ: " +
          (error.code || "unknown")
        );

      }

    }

  });

}


// ===============================
// تعديل منتج
// ===============================

function editProduct(id) {

  const product =
    products.find(item => item.id === id);

  if (!product) {

    toast("المنتج غير موجود");

    return;
  }


  editingId = id;


  if (nameInput)
    nameInput.value =
      product.name || "";


  if (priceInput)
    priceInput.value =
      product.price ?? 0;


  if (quantityInput)
    quantityInput.value =
      product.quantity ?? 0;


  if (categoryInput)
    categoryInput.value =
      product.category || "";


  if (descriptionInput)
    descriptionInput.value =
      product.description || "";


  if (imageInput)
    imageInput.value =
      product.image || "";


  if (saveButton) {

    saveButton.textContent =
      "حفظ التعديل";

  }


  if (cancelButton) {

    cancelButton.hidden = false;

  }


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}


// ===============================
// حذف منتج
// ===============================

async function deleteProduct(id) {

  const product =
    products.find(item => item.id === id);

  if (!product) return;


  const confirmed =
    confirm(
      `هل أنت متأكد من حذف "${product.name}"؟`
    );


  if (!confirmed) return;


  try {

    await deleteDoc(

      doc(db, "products", id)

    );


    toast("تم حذف المنتج ✓");

    await loadProducts();


  } catch (error) {

    console.error(error);

    toast(
      "فشل حذف المنتج: " +
      (error.code || "")
    );

  }

}


// ===============================
// إلغاء التعديل
// ===============================

if (cancelButton) {

  cancelButton.addEventListener(
    "click",
    resetForm
  );

}


// ===============================
// إعادة النموذج
// ===============================

function resetForm() {

  editingId = null;


  if (form) {

    form.reset();

  }


  if (saveButton) {

    saveButton.textContent =
      "إضافة المنتج";

  }


  if (cancelButton) {

    cancelButton.hidden = true;

  }

}


// ===============================
// البحث
// ===============================

if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderProducts
  );

}


// ===============================
// التشغيل
// ===============================

loadProducts();
