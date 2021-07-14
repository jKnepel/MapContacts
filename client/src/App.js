import React from 'react';

import LoginPage from './pages/LoginPage.js';
import HomePage from './pages/HomePage.js';

import './index.css';

/**
 * @description Parent class of project containing session-user and -role. Renders the Loginpage or Homepage depending on the users status.
 */
export default class App extends React.Component {
    constructor() {
        super();

        this.state = {
            sessionUser: '',
            sessionRole: ''
        }

        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    /**
     * @description Sets user variables to passed variables after successful login.
     * 
     * @param {string} username 
     * @param {string} userRole
     */
    login(username, userRole) {
        this.setState({ sessionUser: username, sessionRole: userRole });
    }

    /**
     * @description Logs out the user, resetting all user variables in state.
     */
    logout() {
        this.setState({ sessionUser: '', sessionRole: '' });
    }

    render() {
        // display loginpage when user is not logged in and homepage when they are
        const currentPage = (this.state.sessionUser === '')
        	? <LoginPage login={this.login} />
			: <HomePage username={this.state.sessionUser} userRole={this.state.sessionRole} logout={this.logout} />;

        return (
            <div>
                <div className='backdrop' />
                {currentPage}
            </div>
        )
    }
};