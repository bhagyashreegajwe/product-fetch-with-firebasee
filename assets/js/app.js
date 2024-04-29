let cl = console.log;

const showModal = document.getElementById("showModal");
const backDrop = document.getElementById("backDrop");
const productModal = document.getElementById("productModal");
const closeModalBtns = [... document.querySelectorAll(".closeModal")];
const productForm = document.getElementById("productForm");
const productContainer = document.getElementById("productContainer");
const nameControl = document.getElementById("name");
const imgUrlControl = document.getElementById("imgUrl");
const descriptionControl = document.getElementById("description");
const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");
const loader = document.getElementById("loader");
const statusControl = document.getElementById("status");

const baseUrl = `https://fetch-product-4a0fe-default-rtdb.asia-southeast1.firebasedatabase.app`;
const productUrl = `${baseUrl}/products.json`;

const snackBarMsg = (title,icon,timer) =>{
    swal.fire({
        title:title,
        icon:icon,
        timer:timer
    
    })
}

const makeApiCall = async (apiUrl, methodName,msgBody = null) => {
    loader.classList.remove("d-none");
    try{
        if(msgBody){
            msgBody = JSON.stringify(msgBody)
        }

        let res = await fetch(apiUrl, {
            method : methodName,
            body : msgBody,
            headers : { "Content-Type" : "application/json"}
        })
        return res.json ()
    }catch(err){
        snackBarMsg(err,'error',1500)
    }finally{
        loader.classList.add('d-none');
    }
}

const objToArr = (obj) => {
    let productArr = [];
    for (const key in obj) {
        productArr.push({...obj[key], id: key})
    }

    return productArr
}

const fetchProducts = async () => {
    try{
        let data = await makeApiCall(productUrl, "GET");
        let productArr = objToArr(data);
        cl(productArr);
        templating(productArr.reverse());
    }catch(err){
        snackBarMsg(err,'error',1500)
    }
}

fetchProducts()

const templating = (arr) => {
    productContainer.innerHTML =  arr.map((obj)=>{
        return `
        <div class="col-md-4" id=${obj.id}>
            <div class="card mb-4">
                <figure class="productCard mb-0">
                    <img
                        src="${obj.imgUrl}" 
                        alt="${obj.name}"
                        title="${obj.name}"
                    >
                    <figcaption>
                        <div class="orderSection">
                            <div class="row">
                                <div class="col-sm-8">
                                    <h3 class="prodTitle" title='${obj.name}'>${obj.name}</h3>
                                </div>
                                <div class="col-sm-4 orderStatus">
                                    ${obj.status === 'Ordered' ? `<span class='ordered'>${obj.status}</span>`:
                                        obj.status === 'Shipped'? `<span class='shipped'>${obj.status}</span>`:
                                        obj.status === 'Dispatched'? `<span class='dispatched'>${obj.status}</span>`:
                                        `<span class='delivered'>${obj.status}</span>`
                                    }
                                </div>
                            </div>
                        </div>
                        <div class="descriptionSection">
                            <h3>${obj.name}</h3>
                            <em>Description</em>
                            <p class='description'>
                                ${obj.description}
                            </p>
                            <div class="float-right edit-section">
                                <button class="btn btn-outline-info" onclick='onEdit(this)'>Edit</button>
                                <button class="btn btn-outline-danger" onclick='onDelete(this)'>Delete</button>
                            </div>
                        </div>
                    </figcaption>
                </figure>
            </div>
        </div>
        `
    }).join('')
}

const modalShow = () => {
    backDrop.classList.add('active')
    productModal.classList.add('active')
}

const modalHide = () => {
    backDrop.classList.remove('active')
    productModal.classList.remove('active')
    productForm.reset();
    updateBtn.classList.add('d-none');
    submitBtn.classList.remove('d-none');
}

const createProductCard = (obj) => {
    let card = document.createElement('div');
    card.className = 'col-md-4';
    card.id = obj.id;
    card.innerHTML = `
    <div class="card mb-4">
        <figure class="productCard mb-0">
            <img
                src="${obj.imgUrl}" 
                alt="${obj.name}"
                title="${obj.name}"
            >
            <figcaption>
                <div class="orderSection">
                    <div class="row">
                        <div class="col-sm-8">
                            <h3 class="prodTitle" title='${obj.name}'>${obj.name}</h3>
                        </div>
                        <div class="col-sm-4 orderStatus">
                            <span>${obj.status}</span>
                        </div>
                    </div>
                </div>
                <div class="descriptionSection">
                    <h3>${obj.name}</h3>
                    <em>Description</em>
                    <p class='description'>
                        ${obj.description}
                    </p>
                    <div class="float-right edit-section">
                        <button class="btn btn-outline-info" onclick='onEdit(this)'>Edit</button>
                        <button class="btn btn-outline-danger" onclick='onDelete(this)'>Delete</button>
                    </div>
                </div>
            </figcaption>
        </figure>
    </div>
    `
    productContainer.prepend(card);
}

const onProductAdd = async (eve) => {
    try{
        eve.preventDefault();
        let prodObj = {
            name: nameControl.value,
            description: descriptionControl.value,
            imgUrl: imgUrlControl.value,
            status: statusControl.value,
        }

        let res = await makeApiCall(productUrl, "POST", prodObj);
        cl(res)
        prodObj.id = res.name;
        createProductCard(prodObj);
        snackBarMsg(`Product ${prodObj.name} added successfully`,'success',1500)
        modalHide()
    }catch(err){
        snackBarMsg(err,'error',1500)
    }finally{
        productForm.reset();
    }
}

const onEdit = async (ele) => {
    try{
        let editId = ele.closest('.col-md-4').id;
        localStorage.setItem('editId',editId);
        let editUrl = `${baseUrl}/products/${editId}.json`
        let res = await makeApiCall(editUrl,"GET")
        cl(res)
        nameControl.value = res.name;
        imgUrlControl.value = res.imgUrl;
        descriptionControl.value = res.description;
        statusControl.value = res.status;
        modalShow();
        updateBtn.classList.remove('d-none');
        submitBtn.classList.add('d-none');
    }catch(err){
        snackBarMsg(err,'error',1500)
    }
}

const onProductUpdate = async () => {
    try{
        let updateId = localStorage.getItem('editId');
        cl(updateId)
        let updateUrl = `${baseUrl}/products/${updateId}.json`
        let updateObj = {
            name: nameControl.value,
            description: descriptionControl.value,
            imgUrl: imgUrlControl.value,
            status: statusControl.value,
        }

        let res = await makeApiCall(updateUrl, 'PATCH',updateObj)
        let card = document.getElementById(updateId);
        card.innerHTML = `
        <div class="card mb-4">
            <figure class="productCard mb-0">
                <img
                    src="${res.imgUrl}" 
                    alt="${res.name}"
                    title="${res.name}"
                >
                <figcaption>
                    <div class="orderSection">
                        <div class="row">
                            <div class="col-sm-8">
                                <h3 class="prodTitle" title='${res.name}'>${res.name}</h3>
                            </div>
                            <div class="col-sm-4 orderStatus">
                                <span >${res.status}</span>
                            </div>
                        </div>
                    </div>
                    <div class="descriptionSection">
                        <h3>${res.name}</h3>
                        <em>Description</em>
                        <p class='description'>
                            ${res.description}
                        </p>
                        <div class="float-right edit-section">
                            <button class="btn btn-outline-info" onclick='onEdit(this)'>Edit</button>
                            <button class="btn btn-outline-danger" onclick='onDelete(this)'>Delete</button>
                        </div>
                    </div>
                </figcaption>
            </figure>
        </div>
        `
        modalHide()
        snackBarMsg(`The product ${res.name} is updated successfully`,'success',1500)
    }catch(err){
        snackBarMsg(err,'error',1500)
    }finally{
        productForm.reset();
        updateBtn.classList.add('d-none');
        submitBtn.classList.remove('d-none');
    }
}

const onDelete = async (ele) => {
    let isDelete = await Swal.fire({
        title: "Are you sure you want to delete this product ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    })

    if(isDelete.isConfirmed){
        let deleteId = ele.closest('.col-md-4').id;
        let deleteUrl = `${baseUrl}/products/${deleteId}.json`
        let res = await makeApiCall(deleteUrl,'DELETE');
        document.getElementById(deleteId).remove();
        snackBarMsg('The product deleted successfully!!!','success',1500)
    }
}

showModal.addEventListener('click', modalShow)
closeModalBtns.forEach(btn=>{
    btn.addEventListener('click', modalHide)
})

productForm.addEventListener('submit', onProductAdd)
updateBtn.addEventListener('click',onProductUpdate)
