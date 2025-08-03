import React, { createContext, useState, useEffect, useContext } from 'react';
import { AlertContext } from '../alert/AlertContext';

const ItemsContext = createContext();

const ItemsProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const {showAlert} = useContext(AlertContext);
  

  const localhost = "http://localhost:3000";

 //1 Fetch all items
  const fetchItems = async () => {
    try {
      console.log('REched at fetch Items Function')
        const response = await fetch(`${localhost}/items/`);
        console.log('Done with request inside fetch Items Function')
        if (!response.ok) throw new Error("Failed to fetch items");
        const data = await response.json();
        setItems(data);
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};

//2 Add a new item
const addItem = async (item) => {
    try {
        const response = await fetch(`${localhost}/items/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
        });
        if (!response.ok) throw new Error("Failed to add item");
        const newItem = await response.json();
        setItems((prevItems) => [newItem, ...prevItems]);
        showAlert('Item Added Succesfully', 'Success');
    } catch (error) {
        console.error("Error adding item:", error);
        showAlert('Invalid credentials', 'danger');
    }
};

// Delete item function
// const deleteItem = async (id) => {
//   try {
//     const response = await axios.delete(`${localhost}/items/item/${id}`);

//     if(response.ok){

//       setItems((prevItems) => prevItems.filter((item) => item._id !== id));
//     }
//   } catch (error) {
//     console.error("Error deleting item", error);
//   }
// };

 // Delete item function
 const deleteItem = async (id) => {
  try {
    
    console.log('inside the Delete Item function')
    const response = await fetch(`${localhost}/items/item/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete item");
    }

    setItems((prevItems) => prevItems.filter((item) => item._id !== id));
    showAlert('Item Deleted Succesfully', 'Success');
  } catch (error) {
    console.error("Error deleting item", error);
    showAlert('Invalid credentials', 'danger');
  }
};

// 4() Update item function
// const updateItem = async (id, updatedData) => {
//   try {
//     const response = await axios.put(`${localhost}/items/item/${id}`, updatedData);
//     setItems((prevItems) =>
//       prevItems.map((item) => (item._id === id ? response.data.item : item))
//     );
//   } catch (error) {
//     console.error("Error updating item", error);
//   }
// };

// Update item function
const updateItem = async (id, updatedData) => {
  try {
    console.log('inside the update Item function')
    const response = await fetch(`${localhost}/items/item/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error("Failed to update item");
    }

    const updatedItem = await response.json();
    setItems((prevItems) =>
      prevItems.map((item) => (item._id === id ? updatedItem.item : item))
    );
  } catch (error) {
    console.error("Error updating item", error);
  }
};


  return (
    <ItemsContext.Provider value={{ items, loading, fetchItems, addItem, deleteItem, updateItem }}>
      {children}
    </ItemsContext.Provider>
  );
};

export { ItemsContext, ItemsProvider };
