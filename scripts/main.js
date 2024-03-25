/*************************/
/*    Global Variables   */
/*************************/
const bookList = document.querySelector(".container__book-list");
const addBookForm = document.getElementById("add-book-form");
const message = document.querySelector(".container__add-book-response");
const editBookDiv = document.querySelector(".edit-book");
const editBookClose = document.querySelector(".edit-book__close");
const editBookForm = document.querySelector(".edit-book__form");
const appData = [];

/**************************/
/*    Helper Functions    */
/**************************/

function validateImageUrl(url) {
  const urlRegex = /^https?:\/\/.+\.(jpeg|jpg|webp|png)$/g;
  return urlRegex.test(url);
}

function generateBookObject(bookFormData) {
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
  console.log(price.value);
  if (price.value == "" || isNaN(Number(price.value))) {
    invalidFields.push("Price");
  } else {
    price = Number(price.value);
  }
  console.log(invalidFields);
  if (invalidFields.length > 0) {
    return { error: invalidFields };
  }

  return {
    title,
    author,
    imgUrl,
    status,
    price,
  };
}

function generateBookDiv(bookObj) {
  const { title, author, imgUrl, price, status } = bookObj;
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

  // Setup Edit Button
  const bookEdit = document.createElement("img");
  bookEdit.classList.add("book__controls-edit");
  bookEdit.src = "./images/edit.svg";
  bookEdit.addEventListener("click", (event) => {
    const book = event.target.parentElement.parentElement;
    const title = book.querySelector(".book__details-title").innerText;
    const author = book.querySelector(".book__details-author").innerText;
    editBook(title, author);
  });

  // Setup Delete button
  const bookDelete = document.createElement("img");
  bookDelete.classList.add("book__controls-delete");
  bookDelete.src = "./images/trash.svg";

  bookDelete.addEventListener("click", (event) => {
    const bookDiv = event.target.parentElement.parentElement;
    deleteBook(bookDiv);

    bookDelete.parentElement.parentElement.remove();
    fadeMessage("Book Deleted successfully.", "red");
  });

  const bookControls = document.createElement("div");
  bookControls.classList.add("book__controls");
  bookControls.appendChild(bookEdit);
  bookControls.appendChild(bookDelete);

  // Setup New Book
  const newBook = document.createElement("div");
  newBook.classList.add("book");
  newBook.appendChild(bookCover);
  newBook.appendChild(bookDetails);
  newBook.appendChild(bookControls);

  return newBook;
}

function editBook(title, author) {
  editBookDiv.style.visibility = "visible";
  const bookIdx = getBookIndex(title, author);
  const book = appData[bookIdx];
  editBookForm.title.value = book.title;
  editBookForm.author.value = book.author;
  editBookForm.imgUrl.value =
    book.imgUrl == "./images/image-not-found.png" ? "" : book.imgUrl;
  editBookForm.price.value = book.price;
  editBookForm.status.value = book.status;
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

function saveAppData() {
  const data = appData.filter((book) => book != undefined);
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

function getBookIndex(title, author) {
  for (let idx = 0; idx < appData.length; idx++) {
    const book = appData[idx];
    if (book.title == title || book.author == author) {
      return idx;
    }
  }
  return -1;
}

function deleteBook(bookDiv) {
  const title = bookDiv.querySelector(".book__details-title").innerText;
  const author = bookDiv.querySelector(".book__details-author").innerText;
  const bookIndex = getBookIndex(title, author);
  delete appData[bookIndex];
  saveAppData();
}

/**************/
/*    Main    */
/**************/
addBookForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const newBook = generateBookObject(event.target);
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
  const newBook = generateBookObject(event.target);
  if (newBook.error) {
    const error = newBook.error.join(", ");
    fadeMessage(`Invalid Fields: ${error}`, "red");
  } else {
    const newBookDiv = generateBookDiv(newBook);
    bookList.append(newBookDiv);
    appData.push(newBook);
    saveAppData();
    fadeMessage("Book updated successfully.", "green");
    editBookDiv.style.visibility = "hidden";
  }
});

editBookClose.addEventListener("click", () => {
  editBookDiv.style.visibility = "hidden";
});

loadAppData();
