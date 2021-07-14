import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';

import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import API from '../utils/Api';

/**
 * @description Loginpage for not logged in users containing logic for logging users in/out.
 */
export default class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showLoginForm: true,
            errorLog: ''
        }

        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
    }

    //////////////////////////////////////
    //          Login Methods
    //////////////////////////////////////

    /**
     * @description Creates post request to login endpoint of backend and logs in the user / handling the error that occurred.
     * 
     * @param {string} username 
     * @param {string} password
     */
    login(username, password) {
        // check if userdata contains an empty string
        if (username === '' || password === '') {
            this.setState({ errorLog: 'alle Felder müssen ausgefüllt werden!' });
            return;
        }

        Axios.post(API.USERS + "/login", {
            user: username,
            passw: password
        })
            .then(response => {
                if (response.status === 200) {
                    this.props.login(username, response.data.role);
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' });
                }
            }, error => {
                if (error.response.status === 401) {
                    this.setState({ errorLog: 'Nutzername oder Passwort sind falsch!' });
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.response));
                }
            });
    }

    /**
     * @description Checks if userData is acceptable and adds user to database
     * 
     * @async
     * @param {object} userData 
     */
    async register(userData) {
        // check if userdata contains an empty string
        for (var data in userData) {
            if (data === '') {
                this.setState({ errorLog: 'alle Felder müssen ausgefüllt werden!' });
                return;
            }
        }

        // check if password contains 8 characters and atleast 1 number
        if (!(/^[a-zA-Z0-9]{8,}$/.test(userData.password))) {
            this.setState({ errorLog: 'das Passwort muss mindestens 8 Zeichen und 1 Zahl enthalten!' });
            return;
        }

        // check if passwords are identical
        if (userData.password !== userData.verifyPassword) {
            this.setState({ errorLog: 'das bestätigte Passwort ist falsch!' });
            return;
        }

        let success = false;

        // check if username is already in use
        await Axios.get(API.USERS + "/" + userData.username)
            .then(response => {
                if(response.status === 200) {
                    this.setState({ errorLog: 'dieser nutzername ist bereits vergeben!' });
                }
            })
            .catch(error => {
                if(error.response.status === 404) {
                    success = true;
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.response));
                }
            });

        if (!success) return;

        // create user
        Axios.post(API.USERS + "/register", {
            firstName: userData.firstName,
            lastName: userData.lastName,
            user: userData.username,
            passw: userData.password
        })
            .then(response => {
                if (response.status === 201) {
                    this.props.login(response.data.userId, response.data.role);
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' });
                }
            }, error => {
                this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.response));
                return;
            });
    }

    //////////////////////////////////////
    //             Render
    //////////////////////////////////////

    render() {
        if (this.state.showLoginForm) {
            return (
                <LoginForm
                    login={this.login}
                    errorLog={this.state.errorLog}
                    showRegisterForm={() => { this.setState({ showLoginForm: false, errorLog: '' }); }}
                />
            )
        } else {
            return (
                <RegisterForm
                    register={this.register}
                    errorLog={this.state.errorLog}
                    showLoginForm={() => { this.setState({ showLoginForm: true, errorLog: '' }); }}
                />
            )
        }
    }
}

LoginPage.propTypes = {
    login: PropTypes.func.isRequired
}