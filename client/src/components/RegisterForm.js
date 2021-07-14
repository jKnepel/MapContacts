import React from 'react';
import PropTypes from 'prop-types';

import { useInput } from '../utils/FormHook';

export default function RegisterForm(props) {
    const { value: firstName, bind: bindFirstName } = useInput('');
    const { value: lastName, bind: bindLastName } = useInput('');
    const { value: username, bind: bindUsername } = useInput('');
    const { value: password, bind: bindPassword, reset: resetPassword } = useInput('');
    const { value: verifyPassword, bind: bindVerifyPassword, reset: resetVerifyPassword } = useInput('');

    /**
     * handles the form submit, preventing redirection, calling parents register function and resetting password in form
     * 
     * @param {event} e
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        props.register({
            firstName : firstName,
            lastName : lastName,
            username : username,
            password : password,
            verifyPassword : verifyPassword
        });

        resetPassword();
        resetVerifyPassword();
    }

    return (
        <div className='popup-screen'>
            <div className='popup-container'>
                <h1 style={{ textDecoration: 'underline' }} >Registrieren</h1>
                <form onSubmit={handleSubmit}>
                    <div className='popup-container_row'><input type='text' placeholder='Vorname:' {...bindFirstName} required /></div>
                    <div className='popup-container_row'><input type='text' placeholder='Nachname:' {...bindLastName} required /></div>
                    <div className='popup-container_row'><input type='text' placeholder='Nutzername:' {...bindUsername} required /></div>
                    <div className='popup-container_row'><input type='password' placeholder='Passwort:' {...bindPassword} required /></div>
                    <div className='popup-container_row'><input type='password' placeholder='Passwort bestätigen:' {...bindVerifyPassword} required /></div>
                    <span className='login-link' onClick={() => { props.showLoginForm(); }}>ich habe bereits einen account</span>
                    <div className='buttons'>
                        <input type='submit' value='register' />
                    </div>
                    <p className='error-text'>{props.errorLog}</p>
                </form>
            </div>
        </div>
    );
}

RegisterForm.propTypes = {
    register: PropTypes.func.isRequired,
    errorLog: PropTypes.string.isRequired,
    showLoginForm: PropTypes.func.isRequired
}