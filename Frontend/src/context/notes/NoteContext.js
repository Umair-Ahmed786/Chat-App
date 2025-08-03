import React, { createContext, useContext, useState} from "react";
// import { AlertContext } from "../alert/AlertContext";
import { AlertContext } from '../alert/AlertContext'; // Import AlertContext


// Create a context
const NoteContext = createContext();
const localhost = "http://localhost:3000";

const NoteProvider = (props) => {

  //Creating Alert Context
  const {showAlert} = useContext(AlertContext);
  
  const notesInitial = [];
 
  const [notes, setNotes] = useState(notesInitial);


  //get all notes of particular User:
  // ============>>>>>>>>>>>>
  const getnotes = async () => {

    try {

        const headers = {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem('token')};
  
  
        const response = await fetch(`${localhost}/notes/fetchallnotes`, {
          method: 'GET',  // You can use 'GET', 'PUT', 'DELETE', etc.
          headers: headers,  // Custom headers
          });
  
        const data = await response.json();
        console.log('Success:', data);
        // showAlert('Showing Notes Successfully', 'success'); // Show error alert
        setNotes(data)


    } catch (error) {
      console.error('Error:', error);
      showAlert('Invalid credentials', 'danger'); // Show error alert
    }
  }



  //Adding a note
  const addnote = async (title, description, tag) => {
    try {
      const headers = {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')};
  
      const response = await fetch(`${localhost}/notes/addnote`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          title,
          description,
          tag
        })
      });
  
      const data = await response.json();
      console.log('Success:', data);

      showAlert('Added Note Successfully:', 'success'); // Show error alert

  
        setNotes([...notes, data]);

      // }
  
    } catch (error) {
      console.error('Error:', error);
      showAlert('Invalid credentials', 'danger'); // Show error alert

    }
  };
  

  //delete note
  //  =========>>>>>
  const deletenote = async (id) => {

    try {

      const headers = {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem('token')};


      const response = await fetch(`${localhost}/notes/deletenote/${id}`, {
        method: 'DELETE',  // You can use 'GET', 'PUT', 'DELETE', etc.
        headers: headers,  // Custom headers
        // body: bodyData     // Send body data (only for POST or PUT requests)
      });

      const data = await response.json();
      console.log('Success:', data);
      showAlert('Deleted Note Successfully: ', 'success'); // Show error alert


      const newnote = notes.filter((note) => { return note._id !== id })
      setNotes(newnote);

    } catch (error) {
      console.error('Error:', error);
      showAlert('Invalid credentials', 'danger'); // Show error alert

    }
  }

  //update note
  const editnote = async (id, title, description, tag) => {

    try {

      const headers = {
        "Content-Type": "application/json",
        "auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjZlOTk3MjNhODZmNDVhNjNlMGI3NWYzIn0sImlhdCI6MTcyNjY0MDE0Mn0.wcUGrruRDzJJRNYtx5P_HtEm6Ydhy22oB058JQnitas",
      };


      const response = await fetch(`${localhost}/notes/updatenote/${id}`, {
        method: 'PUT',  // You can use 'GET', 'PUT', 'DELETE', etc.
        headers: headers,  // Custom headers
        body: JSON.stringify({ title, description, tag })     // Send body data (only for POST or PUT requests)
      });

      const data = await response.json();
      console.log('Success:', data);
      showAlert('Updated Note Successfully', 'success'); // Show error alert



      let newnotes = [...notes];

      // Find and update the note
      for (let i = 0; i < newnotes.length; i++) {
        if (newnotes[i]._id === id) {
          newnotes[i].title = title;
          newnotes[i].description = description;
          newnotes[i].tag = tag;
          break;
        }
      }
      setNotes(newnotes);

      // we can use map function for the above for loop as well
      // const updatedNotes = notes.map((note) => 
      //   note._id === id ? { ...note, title, description, tag } : note
      // );



    } catch (error) {
      console.error('Error:', error);
      showAlert('Invalid credentials', 'danger'); // Show error alert

    }

  }

  return (
    <NoteContext.Provider value={{ notes, addnote, deletenote, editnote, getnotes }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export { NoteContext, NoteProvider };
export default NoteProvider;
