let searchResults = []; // Array to store search results
let currentSuggestions = []; // Array to store current suggestions
let allData = []; // Variable to store all data

const sheetId = '1z78L-ekU5Lk-F3b4VHhKS3b1lEYmbbG9bUjmG4ss6Zc'; // Replace 'YOUR_SHEET_ID' with your actual sheet ID
const apiKey = 'AIzaSyCC44a5q3PVMDLMNHKkeNU6LmLDM9vxdL8'; // Replace 'YOUR_API_KEY' with your actual API key

const maxSuggestions = 10; // Maximum number of suggestions to display

function fetchData() {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Trang tính1?key=${apiKey}`;
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data from Google Sheets:', data);
            // Store all data except header row
            allData = data.values.slice(1);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Call fetchData function when the page loads
window.onload = function() {
    fetchData();
    // Refresh data periodically (every 5 minutes)
    setInterval(fetchData, 5 * 60 * 1000);
};





function displaySuggestions(suggestions) {
    const dropdown = document.getElementById('suggestionsDropdown');
    dropdown.innerHTML = ''; // Clear previous suggestions
    if (suggestions.length > 0) {
        dropdown.style.display = 'block';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            option.textContent = suggestion; // Set the content of the option
            dropdown.appendChild(option);
        });

        // Adjust the height of the dropdown to fit all suggestions
        dropdown.size = suggestions.length;
    } else {
        dropdown.style.display = 'none';
    }
}

function selectSuggestion() {
    const selectedSuggestion = document.getElementById('suggestionsDropdown').value;
    document.getElementById('searchInput').value = selectedSuggestion;
    search(); // Trigger search based on selected suggestion
}




function suggestGoods() {
    const input = document.getElementById('searchInput').value.trim().toLowerCase(); // Trim whitespace from input and convert to lowercase

    // Show the dropdown regardless of input
    const dropdown = document.getElementById('suggestionsDropdown');

    // Search for suggestions based on index [1]
    const suggestions = allData.filter(row => row[1].toLowerCase().includes(input)).map(row => row[1]);
    currentSuggestions = suggestions.slice(0, maxSuggestions);
    displaySuggestions(currentSuggestions); // Display the suggestions in dropdown

    // Hide dropdown if there are no suggestions or search input is empty
    dropdown.style.display = currentSuggestions.length === 0 || input === '' ? 'none' : 'block';
}

function search() {
    const inputElement = document.getElementById('searchInput');
    const input = inputElement.value.trim().toLowerCase(); // Trim whitespace from input and convert to lowercase

    // Clear the search input field
    inputElement.value = '';

    // Search for the input in index [1]
    const result = allData.find(row => row[1].toLowerCase() === input);

    if (result) {
        const [code, name, quantity, price, unit, expireDate] = result;
        const resultText = `Mã hàng: ${code}, Tên hàng: ${name}, Số lượng: ${quantity}, Giá: ${price}, Đơn vị: ${unit}, Ngày hết hạn: ${expireDate}`;
        searchResults.push(resultText); // Add result to array
    } else {
        // If code not found, check if there are suggestions and use the first suggestion
        if (currentSuggestions.length > 0 && input.length < currentSuggestions[0].length) {
            document.getElementById('searchInput').value = currentSuggestions[0];
            search(); // Trigger search based on the updated search input
            return;
        } else {
            searchResults.push(`Không tìm thấy mã hàng: ${input}`); // Add result to array
        }
    }
    displayResults(); // Display updated results
}

 
// Function to format currency
function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}


function displayResults() {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (searchResults.length === 0) {
        resultsContainer.innerHTML = 'No results found.';
        return;
    }

    const table = document.createElement('table');
    table.classList.add('result-table');
    table.style.borderCollapse = 'collapse'; // Add border collapse for table
    
    // Create table header
// Create table header
const headerRow = document.createElement('tr');
const headers = ['Mã hàng', 'Tên hàng', 'Số lượng', 'Giá', 'Đơn vị', 'Ngày hết hạn', 'Đặt hàng']; // Updated headers to include unit, expiration date, and order button
headers.forEach(headerText => {
    const headerCell = document.createElement('th');
    headerCell.textContent = headerText;
    headerCell.style.border = '1px solid black'; // Add border to header cell
    headerRow.appendChild(headerCell);
});
    table.appendChild(headerRow);


    
    // Create table rows for search results
    searchResults.forEach(result => {
        const [code, name, quantity, price, unit, expirationDate] = parseResult(result);

        const row = document.createElement('tr');
        row.style.border = '1px solid black'; // Add border to table row

        const codeCell = document.createElement('td');
        codeCell.textContent = code;
        codeCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(codeCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        nameCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(nameCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = quantity;
        quantityCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(quantityCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = price;
        priceCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(priceCell);

        const unitCell = document.createElement('td');
        unitCell.textContent = unit;
        unitCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(unitCell);

        const expirationDateCell = document.createElement('td');
        expirationDateCell.textContent = expirationDate;
        expirationDateCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(expirationDateCell);

        const orderCell = document.createElement('td');
        const orderButton = document.createElement('button');
        orderButton.textContent = 'Order';
        orderButton.classList.add('button-7'); // Add the CSS class 'button-7' to the order button
        orderButton.dataset.code = code; // Set the code as data attribute for the order button
        orderButton.addEventListener('click', addToOrder);
        orderCell.appendChild(orderButton);
        orderCell.style.border = '1px solid black'; // Add border to cell
        row.appendChild(orderCell);

        table.appendChild(row);
    });

    resultsContainer.appendChild(table);
    // Hide the dropdown after search
    document.getElementById('suggestionsDropdown').style.display = 'none';

    // Show the order form if there are search results
    if (searchResults.length > 0) {
        document.getElementById('orderForm').style.display = 'block';
    }
}



function addToOrder(event) {
    const code = event.target.dataset.code;
    const orderTableBody = document.getElementById('orderTableBody');

    // Find the item details by code
    const result = allData.find(row => row[0].trim() === code);

    if (result) {
        const [_, name, quantity, pricePerUnit, unit, expireDate] = result;
        const numericPricePerUnit = parseFloat(pricePerUnit.replace(/\D/g, '')); // Remove non-numeric characters from price

        // Create a new row for the ordered item
        const row = document.createElement('tr');
        

        // Create cells for the item details
        const codeCell = document.createElement('td');
        codeCell.textContent = code;
        row.appendChild(codeCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        row.appendChild(nameCell);

        const quantityCell = document.createElement('td');
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '0';
        quantityInput.value = '0';
        quantityInput.dataset.code = code;
        quantityInput.addEventListener('input', updatePrice);
        quantityCell.appendChild(quantityInput);
        row.appendChild(quantityCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = formatCurrency(0); // Initial price set to 0
        row.appendChild(priceCell);

        // Add a cell for the unit
        const unitCell = document.createElement('td');
        unitCell.textContent = unit;
        row.appendChild(unitCell);

        // Add a cell for the expiration date
        const expireDateCell = document.createElement('td');
        expireDateCell.textContent = expireDate;
        row.appendChild(expireDateCell);

        // Create a remove button
        const removeButtonCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-button'); // Add class for styling
        removeButton.addEventListener('click', removeItemFromOrder); // Add click event listener
        removeButtonCell.appendChild(removeButton);
        row.appendChild(removeButtonCell);

        // Append the row to the order table body
        orderTableBody.appendChild(row);
    }
}



// Function to update price based on quantity input
function updatePrice(event) {
    const quantity = parseInt(event.target.value);
    const code = event.target.dataset.code;
    const row = event.target.closest('tr');

    // Find the item details by code
    const result = allData.find(row => row[0].trim() === code);

    if (result) {
        const [, , , price] = result;
        const pricePerUnit = parseFloat(price.replace(/\D/g, '')); // Parse price per unit as numeric value

        const totalPrice = pricePerUnit * quantity;
        const priceCell = row.querySelector('td:nth-child(4)'); // Get the price cell

        // Update the price cell with formatted total price
        priceCell.textContent = formatCurrency(totalPrice);

        // Trigger total amount update when quantity changes
        updateTotalAmount();
    }
}



function parseResult(result) {
    console.log("Parsing result:", result);
    
    if (Array.isArray(result) && result.length > 0) {
        // If the result is an array, assume it contains the data directly
        return result;
    } else if (typeof result === 'string') {
        // If the result is a string, try to parse it using regex
        const match = result.match(/Mã hàng: (.+), Tên hàng: (.+), Số lượng: (\d+), Giá: (.+), Đơn vị: (.+), Ngày hết hạn: (.+)/);
        console.log("Match:", match);
        if (match) {
            const expireDate = match[6].trim() || ''; // Get the expiration date, return blank if undefined
            return [match[1], match[2], match[3], match[4], match[5], expireDate];
        }
    }
    
    // Return an empty array if parsing fails
    return ['', '', '', '', '', ''];
}



function clearSearch() {
    searchResults = []; // Clear search results array
    displayResults(); // Clear displayed results
}


// Function to submit the order
function submitOrder(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get order details
    const orderItems = [];
    const inputs = document.querySelectorAll('#orderItems input[type="number"]');
    inputs.forEach(input => {
        const code = input.dataset.code;
        const quantity = parseInt(input.value);
        if (quantity > 0) {
            orderItems.push({ code, quantity });
        }
    });

    // Do something with the order items (e.g., send them to a server)
    console.log('Order submitted:', orderItems);

    // Clear the order form after submitting the order
    clearOrderForm();

    // You can add further processing here, such as sending the order to a server
    // and displaying a confirmation message to the user.
}

// Function to clear the order form
function clearOrderForm() {
    // Reset the order form fields
    const orderTableBody = document.getElementById('orderTableBody');
    orderTableBody.innerHTML = ''; // Clear all rows from the order table body

    // Reset the discount input field
    const discountInput = document.getElementById('discountInput');
    discountInput.value = '';

    // Reset the total amount
    updateTotalAmount();
}


// Add event listener to input field to handle "Enter" key press
document.getElementById('searchInput').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        search(); // Call the search function when "Enter" key is pressed
    }
});
// Function to remove an item from the order
function removeItemFromOrder(event) {
    const row = event.target.closest('tr');
    row.remove();
    updateTotalAmount();
}

// Function to update total amount
function updateTotalAmount() {
    const orderTable = document.getElementById('orderTable');
    const rows = orderTable.querySelectorAll('tbody tr');
    let totalAmount = 0;

    rows.forEach(row => {
        const priceCell = row.querySelector('td:nth-child(4)');
        const price = parseFloat(priceCell.textContent.replace(/\D/g, '')); // Parse price as numeric value
        totalAmount += price; // Add the price to the total amount
    });

    // Get the discount value
    const discountInput = document.getElementById('discountInput');
    const discountPercentage = parseFloat(discountInput.value) || 0; // Default to 0 if input is empty or not a valid number

    // Calculate the total amount after applying discount
    const discountedAmount = totalAmount * (1 - discountPercentage / 100);

    // Display the total amount after formatting
    const totalAmountCell = document.getElementById('totalAmount');
    totalAmountCell.textContent = formatCurrency(discountedAmount);
}



