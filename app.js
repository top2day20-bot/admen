import { db } from "./firebase.js";

import {
  ref,
  push,
  set,
  remove,
  onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


// ===============================
// مكان تخزين المنتجات
// ===============================

const productsRef = ref(db, "products");


// ===============================
// عناصر الصفحة
// ===============================

const productForm = document.getElementById("productForm");

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productQuantity = document.getElementById("productQuantity");
const productCategory = document.getElementById("productCategory");
const productDescription = document.getElementById("productDescription");
const productImage = document.getElementById("productImage");

const productsContainer = document.getElementById("productsContainer");

const searchInput = document.getElementById("searchInput");


// ===============================
// المنتجات الموجودة
// ===============================

let products = {};


// ===============================
// قراءة المنتجات من Firebase
// ===============================

onValue(productsRef, (snapshot) => {

  products = snapshot.val() || {};

  displayProducts(products);

}, (error) => {

  console.error(error);

  alert(
    "حدث خطأ أثناء تحميل المنتجات:\n" +
    error.message
  );

});


// ===============================
// إضافة منتج
// ===============================

if (productForm) {

  productForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = productName.value.trim();
    const price = Number(productPrice.value);
    const quantity = Number(productQuantity.value);
    const category = productCategory.value.trim();
    const description = productDescription.value.trim();
    const image = productImage.value.trim();


    // التحقق

    if (!name) {
      alert("اكتب اسم المنتج");
      return;
    }

    if (isNaN(price) || price < 0) {
      alert("اكتب سعر صحيح");
      return;
    }

    if (isNaN(quantity) || quantity < 0) {
      alert("اكتب كمية صحيحة");
      return;
    }


    try {

      // إنشاء ID تلقائي

      const newProductRef = push(productsRef);

      const product = {

        id: newProductRef.key,

        name: name,

        price: price,

        quantity: quantity,

        category: category,

        description: description,

        image: image,

        createdAt: Date.now()

      };


      await set(newProductRef, product);


      alert("تمت إضافة المنتج بنجاح ✅");


      productForm.reset();


    } catch (error) {

      console.error(error);

      alert(
        "فشلت إضافة المنتج ❌\n\n" +
        error.message
      );

    }

  });

}


// ===============================
// عرض المنتجات
// ===============================

function displayProducts(data) {

  if (!productsContainer) return;


  productsContainer.innerHTML = "";


  const list = Object.values(data);


  if (list.length === 0) {

    productsContainer.innerHTML = `
      <div class="empty-products">
        لا توجد منتجات حالياً
      </div>
    `;

    return;

  }


  list.forEach(product => {

    const card = document.createElement("div");

    card.className = "product-card";


    card.innerHTML = `

      <div class="product-image">

        ${
          product.image
          ?
          `<img src="${escapeHtml(product.image)}"
                alt="${escapeHtml(product.name)}"
                onerror="this.style.display='none'">`
          :
          `<div class="no-image">بدون صورة</div>`
        }

      </div>


      <div class="product-info">

        <h3>
          ${escapeHtml(product.name)}
        </h3>

        <div class="product-price">
          ${Number(product.price).toLocaleString("ar-EG")} جنيه
        </div>

        <div class="product-quantity">
          الكمية: ${product.quantity}
        </div>

        ${
          product.category
          ?
          `<div class="product-category">
            ${escapeHtml(product.category)}
          </div>`
          :
          ""
        }

        ${
          product.description
          ?
          `<p>
            ${escapeHtml(product.description)}
          </p>`
          :
          ""
        }

        <button
          class="delete-product"
          data-id="${product.id}">
          حذف المنتج
        </button>

      </div>

    `;


    productsContainer.appendChild(card);

  });


  // أزرار الحذف

  document
    .querySelectorAll(".delete-product")
    .forEach(button => {

      button.addEventListener("click", () => {

        deleteProduct(button.dataset.id);

      });

    });

}


// ===============================
// حذف منتج
// ===============================

async function deleteProduct(id) {

  if (!id) return;


  const confirmDelete = confirm(
    "هل أنت متأكد من حذف هذا المنتج؟"
  );


  if (!confirmDelete) return;


  try {

    const productRef = ref(
      db,
      "products/" + id
    );

    await remove(productRef);


    alert("تم حذف المنتج ✅");


  } catch (error) {

    console.error(error);

    alert(
      "فشل حذف المنتج ❌\n\n" +
      error.message
    );

  }

}


// ===============================
// البحث
// ===============================

if (searchInput) {

  searchInput.addEventListener("input", () => {

    const search = searchInput.value
      .trim()
      .toLowerCase();


    if (!search) {

      displayProducts(products);

      return;

    }


    const filtered = {};


    Object.entries(products).forEach(([id, product]) => {

      const name =
        String(product.name || "")
          .toLowerCase();

      const category =
        String(product.category || "")
          .toLowerCase();


      if (
        name.includes(search) ||
        category.includes(search)
      ) {

        filtered[id] = product;

      }

    });


    displayProducts(filtered);

  });

}


// ===============================
// حماية النصوص
// ===============================

function escapeHtml(value) {

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}
