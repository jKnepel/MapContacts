import React from 'react';
import PropTypes from 'prop-types';
import { SliderPicker } from 'react-color'

import { useInput } from '../utils/FormHook';

/**
 * @description Universal form for inputting contact data. This form is designed to be used as add and edit form for contacts.
 * 
 * @param {*} props 
 */
export default function ContactForm(props) {
    //////////////////////////////////////
    //        Set Contact Data
    //////////////////////////////////////

    // initialize data empty or populate it with passed data if it exists
    const initialContactData = (props.contactData === null)
        ? { ownerId: props.username, name: '', surname: '', gender: 'm', title: '', street: '', pc: '', city: '', country: '', private: true, email: '', color: '#B7A131' }
        : {
            ownerId: props.contactData.ownerId,
            name: props.contactData.name,
            surname: props.contactData.surname,
            gender: props.contactData.gender,
            title: props.contactData.title,
            street: props.contactData.street,
            pc: props.contactData.pc,
            city: props.contactData.city,
            country: props.contactData.country,
            private: props.contactData.private,
            email: props.contactData.email,
            color: props.contactData.color
        }

    // custom hook for getting input and binding it to corresponding values
    const { value: ownerId, bind: bindOwnerId } = useInput(initialContactData.ownerId);
    const { value: name, bind: bindName } = useInput(initialContactData.name);
    const { value: surname, bind: bindSurname } = useInput(initialContactData.surname);
    const { value: gender, bind: bindGender } = useInput(initialContactData.gender);
    const { value: title, bind: bindTitle } = useInput(initialContactData.title);
    const { value: street, bind: bindStreet } = useInput(initialContactData.street);
    const { value: pc, bind: bindPc } = useInput(initialContactData.pc);
    const { value: city, bind: bindCity } = useInput(initialContactData.city);
    const { value: country, bind: bindCountry } = useInput(initialContactData.country);
    const { checked: privat, bindChecked: bindPrivat } = useInput(initialContactData.private);
    const { value: email, bind: bindEmail } = useInput(initialContactData.email);
    const { color, bindColor } = useInput(initialContactData.color);

    //////////////////////////////////////
    //        Set Contact Buttons
    //////////////////////////////////////

    // display select menu for choosing which user is supposed to own the contact if current user is admin
    const userMenu = (props.userRole === 'admin' && props.userData.length > 0)
    ? <div className='popup-container_row user_selector'>
        <select {...bindOwnerId}>
            {props.userData.map((data, index) => (
                <option key={index} value={data.userId}>{data.userId}</option>
            ))}
        </select>
    </div>
    : undefined;

    // display correct elements depending on wether the form is adding or editing a contact
    const header = (props.contactData === null) ? 'hinzufügen' : 'bearbeiten';
    const deleteButton = (props.contactData === null) ? undefined : <input type='button' onClick={() => { props.deleteContact(); }} value='löschen' />;

    //////////////////////////////////////
    //               Render
    //////////////////////////////////////

    // handles form submit, preventing redirect, collecting data into object and calling correct prop function using the data
    const handleSubmit = (e) => {
        e.preventDefault();

        const newContactData = {
            ownerId: ownerId,
            name: name,
            surname: surname,
            gender: gender,
            title: title,
            street: street,
            pc: pc,
            city: city,
            country: country,
            private: privat,
            email: email,
            color: color
        }

        if (props.contactData === null) props.addContact(newContactData);
        else props.editContact(newContactData);
    }

    return (
        <div className='popup-screen grey-backdrop' id='newContact-screen' onClick={(e) => { if (e.target.id === 'newContact-screen') props.hideContactForm(); }}>
            <div className='popup-container'>
                <h1 style={{ textDecoration: 'underline' }}>Kontakt {header}</h1>
                <form id='createContact-form' onSubmit={(e) => { handleSubmit(e); }}>
                    {userMenu}
                    <div className='popup-container_row'><input type='text' placeholder='Vorname:' {...bindName} required />*</div>
                    <div className='popup-container_row'><input type='text' placeholder='Nachname:' {...bindSurname} required />*</div>
                    <div className='popup-container_row'>
                        <select {...bindGender}>
                            <option value='m'>Männlich</option>
                            <option value='w'>Weiblich</option>
                            <option value='d'>Divers</option>
                        </select>
                    </div>
                    <div className='popup-container_row'><input type='text' placeholder='Titel:' {...bindTitle} /></div>
                    <div className='popup-container_row'><input type='text' placeholder='Straße:' {...bindStreet} required />*</div>
                    <div className='popup-container_row'><input type='text' placeholder='PLZ:' {...bindPc} required />*</div>
                    <div className='popup-container_row'><input type='text' placeholder='Stadt:' {...bindCity} required />*</div>
                    <div className='popup-container_row'><input type='text' placeholder='Land:' {...bindCountry} required />*</div>
                    <div className='popup-container_row'><div><label>Privat:</label><input type='checkbox' {...bindPrivat} /></div></div>
                    <div className='popup-container_row'><input type='text' placeholder='Email:' {...bindEmail} /></div>
                    <div className='popup-container_column'>Kontaktfarbe:<SliderPicker {...bindColor} /></div>
                    <div className='buttons'>
                        <input type='button' value='zurück' onClick={() => { props.hideContactForm() }} />
                        {deleteButton}
                        <input type='submit' value='bestätigen' />
                    </div>
                    <p className='error-text'>{props.errorLog}</p>
                </form>
            </div>
        </div>
    )
}

ContactForm.propTypes = {
    contactData: PropTypes.object,
    userData: PropTypes.array,
    username: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    hideContactForm: PropTypes.func.isRequired,
    addContact : PropTypes.func.isRequired,
    editContact : PropTypes.func.isRequired,
    deleteContact : PropTypes.func.isRequired,
    errorLog : PropTypes.string.isRequired
}