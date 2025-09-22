const urlBase = 'http://165.22.38.28/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let editId = 0;

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";	
	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
	document.getElementById("loginResult").innerHTML = "";
	let tmp = {login:login,password:password};
	let jsonPayload = JSON.stringify( tmp );
	let url = urlBase + '/Login.' + extension;
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
				if( userId < 1 )
				{
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}
				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;
				saveCookie();
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

async function doRegister()
{
	// Helper function to grab user input values
	const inputValue = (id) => document.getElementById(id).value;

	const first = inputValue("fName");
	const last = inputValue("lName");
	const login = inputValue("signUpLoginName");
	const password = inputValue("signUpLoginPassword");

	const result = document.getElementById("registerResult");

	if(!first || !last || !login || !password){
		result.textContent = "Please fill out all fields";
		result.style.color = "black";
		return;
	}
	
	//create JSON payload
	const userData = {
		firstName: first,
		lastName: last,
		login: login,
		password: password
	};

	try{
		const response = await fetch(urlBase + "/SignUp." + extension, {method: 'POST', headers: {"Content-type": "application/json; charset=UTF-8"}, body: JSON.stringify(userData)});

		const data = await response.json(); // Parses for response

		if(data.success){ // success = true
			const loginResult = document.getElementById("loginResult").textContent = "User Created!"

			// redirect to login button and clear form
			document.getElementById("fName").value = '';
			document.getElementById("lName").value = '';
			document.getElementById("signUpLoginName").value = '';
			document.getElementById("signUpLoginPassword").value = '';

			document.getElementById("switchButton").click();
		} else if(!data.success){ // success = false
			result.textContent = data.message;
			result.style.color = "black";
		}
	} catch(err){
		console.error("Error: ", err);
		result.textContent = err.message;
		result.style.color = 'black';
	}
}

function saveCookie()
{
	let minutes = 30;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}
	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function switchMode() {
	var x = document.getElementById("loginDiv");
	var y = document.getElementById("boxBody");
	var z = document.getElementById("signupDiv");
	if (x.style.display === "none") {
		z.style.display = "none";
		x.style.display = "block";
	} else {
		document.getElementById("fName").value = '';
		document.getElementById("lName").value = '';
		document.getElementById("signUpLoginName").value = '';
		document.getElementById("signUpLoginPassword").value = '';
		document.getElementById("registerResult").textContent = "";

		x.style.display = "none";
		z.style.display = "block";
	}
}

function quoteFix(str) {
	if (!str) return '';
	return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

async function getContacts() {
	if (userId < 1) {
		readCookie();
	}
	try {
		const searchTerm = document.getElementById("searchQuery").value;
		if (searchTerm === null) {
			searchTerm = "";
		}
		const tableBody = document.getElementById('tableBody');
		tableBody.innerHTML = "";
		const response = await fetch(urlBase + "/SearchContacts." + extension, {
			method: 'POST',
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			},
			body: JSON.stringify({
				userID: userId,
				search: searchTerm
			})
		});
		if (!response.ok) {
			throw new Error('API Error: ${response.status}');
		}
		const data = await response.json();
		if (data.error) {
			throw new Error('Data Error: ${data.error}');
		}
		if (!data || data.length === 0) {
			tableBody.innerHTML = '<tr><td colspan="5">No contacts found. Try adding one!</td></tr>';
			return;
		}
		const fields = Object.keys(data.results[0]);
		let cellCount = 0;
		data.results.forEach(item => {
			const row = tableBody.insertRow();
			fields.forEach(field => {
				if (cellCount != 4) {
					const cell = row.insertCell();
					cell.textContent = item[field] ?? 'None';
					cellCount++;
				}
			});
			const opsButtons = row.insertCell();
			opsButtons.innerHTML = `
				<button class="buttons" onclick="loadEdit('${quoteFix(item.id)}','${quoteFix(item.first)}','${quoteFix(item.last)}','${quoteFix(item.email)}','${quoteFix(item.phone)}');">Edit</button>
				<button class="buttons" onclick="deleteContact('${quoteFix(item.id)}','${quoteFix(item.first)}','${quoteFix(item.last)}','${quoteFix(item.email)}','${quoteFix(item.phone)}');">Delete</button>
			`;
			cellCount = 0;
		});
	} catch (error) {
		console.error('Error:', error);
	}
}


function loadEdit(id, first, last, email, phone) {
	var a = document.getElementById('editMenu');
	var b = document.getElementById('deletePrompt');
	var c = document.getElementById('addMenu');
	a.classList.add('show');
	b.classList.remove('show');
	c.classList.add('hide');

	document.getElementById("contactsF").value = first || '';
	document.getElementById("contactsL").value = last || '';
	document.getElementById("contactsE").value = email || '';
	document.getElementById("contactsP").value = phone || '';
	editId = id;
}

async function addContact() {
	const addFirst = document.getElementById("addF");
	const addLast = document.getElementById("addL");
	const addEmail = document.getElementById("addE");
	const addPhone = document.getElementById("addP");

	const result = document.getElementById("contactsResult");

	if(!addFirst.value || !addLast.value || !addEmail.value || !addPhone.value){
		result.textContent = "Please fill out all fields";
		result.style.color = "black";
		return;
	}
	
	//create JSON payload
	const userData = {
		userID: userId,
		first: addFirst.value,
		last: addLast.value,
		email: addEmail.value,
		phone: addPhone.value
	};

	try{
		const response = await fetch(urlBase + "/AddContact." + extension, {method: 'POST', headers: {"Content-type": "application/json; charset=UTF-8"}, body: JSON.stringify(userData)});

		const data = await response.json(); // Parses for response

		if(!data.error){ // success = true
			result.textContent = "Contact Record Created!";

			addFirst.value = '';
			addLast.value = '';
			addEmail.value = '';
			addPhone.value = '';
			getContacts();
		} else { // success = false
			result.textContent = data.message;
			result.style.color = "black";
		}
	} catch(err){
		console.error("Error: ", err);
		result.textContent = err.message;
		result.style.color = 'black';
	}
}

async function confirmEdit(){
	const edFirst = document.getElementById("contactsF");
	const edLast = document.getElementById("contactsL");
	const edEmail = document.getElementById("contactsE");
	const edPhone = document.getElementById("contactsP");

	const result = document.getElementById("contactsResult");

	if(!edFirst.value || !edLast.value || !edEmail.value || !edPhone.value){
		result.textContent = "Please fill out all fields";
		result.style.color = "black";
		return;
	}
	
	//create JSON payload
	const payload = {
		id: editId,
		first: edFirst.value,
		last: edLast.value,
		email: edEmail.value,
		phone: edPhone.value
	};

	try{
		const response = await fetch(urlBase + "/EditContact." + extension, {method: 'POST', headers: {"Content-type": "application/json; charset=UTF-8"}, body: JSON.stringify(payload)});

		const data = await response.json(); // Parses for response

		if(!data.error){ // success = true
			result.textContent = "Contact Record Edited!";
			cancelFunc();
			getContacts();
		} else { // success = false
			result.textContent = data.message;
			result.style.color = "black";
		}
	} catch(err){
		console.error("Error: ", err);
		result.textContent = err.message;
		result.style.color = 'black';
	}

}

function cancelFunc() {
	var a = document.getElementById('editMenu');
	var b = document.getElementById('deletePrompt');
	var c = document.getElementById('addMenu');
	a.classList.remove('show');
	b.classList.remove('show');
	c.classList.remove('hide');
}

function deleteContact(id, first, last, email, phone) {
	var a = document.getElementById('editMenu');
	var b = document.getElementById('deletePrompt');
	var c = document.getElementById('addMenu');
	a.classList.remove('show');
	b.classList.add('show');
	c.classList.add('hide');

	const output = document.getElementById('deleteSelect');
	output.textContent = first + ' | ' + last + ' | ' + email + ' | ' + phone;
	editId = id;
}

async function confirmDelete() {
	const payload = {
		id: editId
	};
	const result = document.getElementById("contactsResult");
	try{
		const response = await fetch(urlBase + "/DeleteContact." + extension, {method: 'POST', headers: {"Content-type": "application/json; charset=UTF-8"}, body: JSON.stringify(payload)});

		const data = await response.json(); // Parses for response

		if(!data.error){ // success = true
			result.textContent = "Contact Record Deleted!";
			cancelFunc();
			getContacts();
		} else { // success = false
			result.textContent = data.message;
			result.style.color = "black";
		}
	} catch(err){
		console.error("Error: ", err);
		result.textContent = err.message;
		result.style.color = 'black';
	}
}
