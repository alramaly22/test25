/*=============== MODAL PRODUCT LOGIC ===============*/
const modal = document.getElementById("pizzaModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const closeBtn = document.querySelector(".modal__close");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById("cart-count");
const addToCartBtn = document.getElementById("addToCartBtn");
const qtyInput = document.getElementById("modalQty");
const increaseQty = document.getElementById("increaseQty");
const decreaseQty = document.getElementById("decreaseQty");
const loadingOverlay = document.getElementById("loadingOverlay");

/*=============== OPEN / CLOSE PRODUCT MODAL ===============*/
document.querySelectorAll(".open-modal").forEach(button => {
    button.addEventListener("click", () => {
        modal.style.display = "flex";
        modalImg.src = button.dataset.img;
        modalName.textContent = button.dataset.name;
        modalDesc.textContent = button.dataset.desc;
        modalPrice.textContent = button.dataset.price;
        qtyInput.value = 1;
    });
});

closeBtn.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

/*=============== QTY BUTTONS ===============*/
increaseQty.addEventListener("click", () => qtyInput.value = parseInt(qtyInput.value) + 1);
decreaseQty.addEventListener("click", () => { if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1; });

/*=============== CART FUNCTIONS ===============*/
function addToCart(name, price, img, qty) {
    price = parseFloat(price.replace("$", ""));
    let product = cart.find(item => item.name === name);
    if (product) product.qty += qty;
    else cart.push({ name, price, img, qty });
    saveCart();
    updateCartCount();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("cartTotal", cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2));
}

function updateCartCount() {
    if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

/*=============== ADD TO CART FROM MODAL ===============*/
if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
        let qty = parseInt(qtyInput.value);
        addToCart(modalName.textContent, modalPrice.textContent, modalImg.src, qty);
        modal.style.display = "none";
        qtyInput.value = 1;
    });
}

/*=============== GO TO CHECKOUT FROM CART ICON ===============*/
const cartIcon = document.querySelector(".nav__cart");
if (cartIcon) {
    cartIcon.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("❌ Your cart is empty! Please add some products first.");
            return;
        }
        window.location.href = "/checkout/";
    });
}

/*=============== CHECKOUT MODAL LOGIC ===============*/
const checkoutModal = document.getElementById("checkoutModal");
const checkoutBtn = document.getElementById("checkoutBtn");
const modalCloseBtn = document.querySelector(".checkout-close");

if (checkoutBtn && checkoutModal) {
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("❌ Your cart is empty! Please add some products first.");
            return;
        }
        checkoutModal.style.display = "flex";
    });
}

if (modalCloseBtn) modalCloseBtn.addEventListener("click", () => checkoutModal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === checkoutModal) checkoutModal.style.display = "none"; });

/*=============== CHECKOUT FORM (VALIDATION + SUBMIT) ===============*/
const checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", function(e) {
        e.preventDefault();

        // ✅ VALIDATION
        let isValid = true;
        const name = document.getElementById("name");
        const phone = document.getElementById("phone");
        const address = document.getElementById("address");

        document.querySelectorAll(".error-message").forEach(msg => msg.textContent = "");

        if (!/^[a-zA-Z\s]{3,}$/.test(name.value)) {
            name.nextElementSibling.textContent = "Please enter a valid name (letters only)";
            isValid = false;
        }

        if (!/^[0-9]{8,15}$/.test(phone.value)) {
            phone.nextElementSibling.textContent = "Please enter a valid phone number (digits only)";
            isValid = false;
        }

        if (address.value.trim().length < 5) {
            address.nextElementSibling.textContent = "Please enter a valid address";
            isValid = false;
        }

        if (!isValid) return;

        if (loadingOverlay) loadingOverlay.style.display = "flex";

        const orderData = {
            name: name.value,
            phone: phone.value,
            address: address.value,
            notes: document.getElementById("notes").value,
            payment_method: document.getElementById("payment").value,
            items: cart,
            total: parseFloat(document.getElementById("cartTotal").textContent)
        };

        fetch("/api/create-order/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(orderData)
            })
            .then(res => res.json())
            .then(data => {
                console.log("Order Response:", data);
                if (orderData.payment_method === "ONLINE") {
                    if (data.checkout_url) {
                        setTimeout(() => { window.location.href = data.checkout_url; }, 1500);
                    } else {
                        alert("❌ Payment Error: " + (data.error || "Unknown error"));
                        if (loadingOverlay) loadingOverlay.style.display = "none";
                    }
                } else {
                    setTimeout(() => {
                        alert("✅ Order confirmed!");
                        localStorage.removeItem("cart");
                        checkoutForm.reset();
                        checkoutModal.style.display = "none";
                        window.location.href = "/";
                    }, 1500);
                }
            })
            .catch(err => {
                console.error(err);
                alert("❌ Error placing order.");
                if (loadingOverlay) loadingOverlay.style.display = "none";
            });
    });
}

/*=============== INIT CART COUNT ===============*/
updateCartCount();