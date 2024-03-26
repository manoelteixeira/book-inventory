/*************************/
/*    Global Variables   */
/*************************/
const bookList = document.querySelector(".container__book-list");
const addBookForm = document.getElementById("add-book-form");
const message = document.querySelector(".container__add-book-response");
const editBookDiv = document.querySelector(".edit-book");
const editBookClose = document.querySelector(".edit-book__close");
const editBookForm = document.querySelector(".edit-book__form");
const bookInfoClose = document.querySelector(".book-info__close");
const bookInfoDiv = document.querySelector(".book-info");
let appData = [];
let editBookId = "";

/**************************/
/*    Helper Functions    */
/**************************/

function saveAppData() {
  const data = appData.filter((book) => book != null);
  const dataString = JSON.stringify(data);
  localStorage.setItem("app-data", dataString);
}

function loadAppData() {
  const localData = localStorage.getItem("app-data");
  if (localData) {
    const data = JSON.parse(localData);
    appData.push(...data);
    for (const book of appData) {
      bookList.appendChild(generateBookDiv(book));
    }
  }
}

function fadeMessage(str, color) {
  message.innerText = str;
  message.style.color = color;
  message.style.display = "";
  message.classList.add("fade");
  setTimeout(() => {
    message.classList.remove("fade");
    message.innerText = "";
  }, 5000);
}

function clearAddBookForm() {
  addBookForm.title.value = "";
  addBookForm.author.value = "";
  addBookForm.imgUrl.value = "";
  addBookForm.price.value = "";
  addBookForm.status.value = "in-stock";
}

function validateImageUrl(url) {
  const urlRegex = /^https?:\/\/.+\.(jpeg|jpg|webp|png)$/g;
  return urlRegex.test(url);
}

function createNewBook(bookFormData) {
  let { title, author, imgUrl, status, price } = bookFormData;
  // Validate Data
  const invalidFields = [];
  if (title.value == "") {
    invalidFields.push("Title");
  } else {
    title = title.value;
  }

  if (author.value == "") {
    invalidFields.push("Author");
  } else {
    author = author.value;
  }

  if (imgUrl.value == "") {
    imgUrl = "./images/image-not-found.png";
  } else if (!validateImageUrl(imgUrl.value)) {
    invalidFields.push("Image URL");
  } else {
    imgUrl = imgUrl.value;
  }

  if (status.value == "") {
    invalidFields.push(status);
  } else {
    status = status.value;
  }
  price.value = price.value.replace(",", ".");

  if (price.value == "" || isNaN(Number(price.value))) {
    invalidFields.push("Price");
  } else {
    price = Number(price.value);
  }

  if (invalidFields.length > 0) {
    return { error: invalidFields };
  }
  const now = new Date();
  const timestamp = now.toGMTString();
  id = crypto.randomUUID();
  return {
    id,
    title,
    author,
    imgUrl,
    status,
    price,
    timestamp,
  };
}

function getBookIndex(bookId) {
  for (let idx = 0; idx < appData.length; idx++) {
    const id = appData[idx].id;
    if (bookId == id) {
      return idx;
    }
  }
  return -1;
}

function showBookInfo(bookId) {
  const bookIdx = getBookIndex(bookId);
  const { title, author, imgUrl, status, price, timestamp } = appData[bookIdx];
  const divTitle = document.querySelector(".book-info__title");
  const divImage = document.querySelector(".book-info__image");
  const divAuthor = document.querySelector(".book-info__author");
  const divPrice = document.querySelector(".book-info__price");
  const divStatus = document.querySelector(".book-info__status");
  const divTimestamp = document.querySelector(".book-info__timestamp");

  divTitle.innerText = title;
  divImage.src = imgUrl;
  divAuthor.innerText = author;
  divPrice.innerText = `$${price}`;
  if (status == "in-stock") {
    divStatus.innerText = "In Stock";
  } else {
    divStatus.innerText = "Out of Stock";
  }
  divTimestamp.innerText = timestamp;

  bookInfoDiv.style.visibility = "visible";
}

function deleteBook(bookId) {
  const bookIndex = getBookIndex(bookId);
  appData = appData.slice(0, bookIndex).concat(appData.slice(bookIndex + 1));
  saveAppData();
}

function loadEditBookForm(bookId) {
  const bookIdx = getBookIndex(bookId);
  const book = appData[bookIdx];
  editBookDiv.style.visibility = "visible";
  editBookForm.title.value = book.title;
  editBookForm.author.value = book.author;
  editBookForm.imgUrl.value =
    book.imgUrl == "./images/image-not-found.png" ? "" : book.imgUrl;
  editBookForm.price.value = book.price;
  editBookForm.status.value = book.status;
}

function generateBookDiv(bookObj) {
  const { id, title, author, imgUrl, price, status } = bookObj;
  // Setup Image
  const bookCover = document.createElement("img");
  bookCover.classList.add("book__cover");
  bookCover.src = imgUrl;

  // Setup Book Details
  const detailsTitle = document.createElement("span");
  detailsTitle.classList.add("book__details-title");
  detailsTitle.innerText = title;

  const detailsAuthor = document.createElement("span");
  detailsAuthor.classList.add("book__details-author");
  detailsAuthor.innerText = author;

  const detailsStatus = document.createElement("span");
  detailsStatus.classList.add("book__details-status", status);
  detailsStatus.innerHTML = status == "in-stock" ? "In Stock" : "Out of Stock";

  const detailsPrice = document.createElement("span");
  detailsPrice.classList.add("book__details-price");
  detailsPrice.innerText = `\$${price}`;

  const bookDetails = document.createElement("div");
  bookDetails.classList.add("book__details");
  bookDetails.appendChild(detailsTitle);
  bookDetails.appendChild(detailsAuthor);
  bookDetails.appendChild(detailsStatus);
  bookDetails.appendChild(detailsPrice);

  // Setup Book Info Button
  const bookInfo = document.createElement("img");
  bookInfo.classList.add("book__controls-info");
  bookInfo.src = "./images/info.svg";
  bookInfo.addEventListener("click", (event) => {
    const bookId = event.target.parentElement.parentElement.id;
    showBookInfo(bookId);
  });

  // Setup Edit Button
  const bookEdit = document.createElement("img");
  bookEdit.classList.add("book__controls-edit");
  bookEdit.src = "./images/edit.svg";
  bookEdit.addEventListener("click", (event) => {
    const bookId = event.target.parentElement.parentElement.id;
    loadEditBookForm(bookId);
    editBookId = bookId;
    event.target.parentElement.parentElement.remove();
  });

  // Setup Delete button
  const bookDelete = document.createElement("img");
  bookDelete.classList.add("book__controls-delete");
  bookDelete.src = "./images/trash.svg";

  bookDelete.addEventListener("click", (event) => {
    const bookId = event.target.parentElement.parentElement.id;
    bookDelete.parentElement.parentElement.remove();
    deleteBook(bookId);
    fadeMessage("Book Deleted successfully.", "red");
  });

  const bookControls = document.createElement("div");
  bookControls.classList.add("book__controls");
  bookControls.appendChild(bookInfo);
  bookControls.appendChild(bookEdit);
  bookControls.appendChild(bookDelete);

  // Setup New Book
  const newBook = document.createElement("div");
  newBook.id = id;
  newBook.classList.add("book");
  newBook.appendChild(bookCover);
  newBook.appendChild(bookDetails);
  newBook.appendChild(bookControls);

  return newBook;
}

/**************/
/*    Main    */
/**************/
addBookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newBook = createNewBook(event.target);
  if (newBook.error) {
    const error = newBook.error.join(", ");
    fadeMessage(`Invalid Fields: ${error}`, "red");
  } else {
    const newBookDiv = generateBookDiv(newBook);
    bookList.append(newBookDiv);
    appData.push(newBook);
    saveAppData();
    fadeMessage("Book added successfully.", "green");
    clearAddBookForm();
  }
});

editBookForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const bookIdx = getBookIndex(editBookId);
  console.log(bookIdx);
  const { title, author, imgUrl, price, status } = event.target;
  appData[bookIdx].title = title.value;
  appData[bookIdx].author = author.value;
  appData[bookIdx].imgUrl =
    imgUrl.value == "" ? "./images/image-not-found.png" : imgUrl.value;
  appData[bookIdx].price = price.value;
  appData[bookIdx].status = status.value;
  const updatedBook = generateBookDiv(appData[bookIdx]);
  bookList.appendChild(updatedBook);
  saveAppData();
  editBookDiv.style.visibility = "hidden";
});

editBookClose.addEventListener("click", () => {
  editBookDiv.style.visibility = "hidden";
});

bookInfoClose.addEventListener("click", () => {
  bookInfoDiv.style.visibility = "hidden";
});

loadAppData();
