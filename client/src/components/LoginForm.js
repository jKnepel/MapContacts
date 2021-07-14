import React from 'react';
import PropTypes from 'prop-types';

import { useInput } from '../utils/FormHook';

/**
 * @description Universal form for inputting login data using custom Hook.
 * 
 * @param {*} props 
 */
export default function LoginForm(props) {
    const { value: username, bind: bindUsername } = useInput('');
    const { value: password, bind: bindPassword, reset: resetPassword } = useInput('');

    /**
     * handles the form submit, preventing redirection, calling parents login function and resetting password in form
     * 
     * @param {event} e
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        props.login(username, password);

        resetPassword();
    }

    return (
        <div className='popup-screen'>
            <div className='popup-container'>
                <h1 style={{ textDecoration: 'underline' }} >Anmelden</h1>
                <form onSubmit={handleSubmit}>
                    <div className='popup-container_row'><input type='text' placeholder='Nutzername:' {...bindUsername} required /></div>
                    <div className='popup-container_row'><input type='password' placeholder='Passwort:' {...bindPassword} required /></div>
                    <span className='login-link' onClick={() => { props.showRegisterForm(); }}>erstelle einen account</span>
                    <div className='buttons'>
                        <input type='submit' value='login' />
                    </div>
                    <p className='error-text'>{props.errorLog}</p>
                </form>
            </div>
        </div>
    );
}

LoginForm.propTypes = {
    login: PropTypes.func.isRequired,
    errorLog: PropTypes.string.isRequired,
    showRegisterForm: PropTypes.func.isRequired
}