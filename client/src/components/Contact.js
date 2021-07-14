import React from 'react';
import PropTypes from 'prop-types';

class Contact extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        }

        this.renderHiddenContact = this.renderHiddenContact.bind(this);
    }

    render() {
        return (
            <div className='contact'>
                <div className='contact-visible' title='Klappe Kontakt auf' onClick={() => { this.setState({ expanded: !this.state.expanded }) }}>
                    <div className='contact-visible_left'>
                        <b>
                            <label style={{ color: this.props.contactData.color }}>{'\u25AC'} </label>
                            {this.props.contactData.surname}, {this.props.contactData.name}
                        </b>
                    </div>
                    <div className='contact-visible_right'>
                        <b>{'\u25BC'}</b>
                    </div>
                </div>
                {this.renderHiddenContact()}
            </div>
        )
    }

    renderHiddenContact() {
        // return hidden part of contact if wanted
        if (this.state.expanded) {
            // turn gender into readable value
            let gender = '';
            if (this.props.contactData.gender === 'd') gender = 'Divers';
            else if (this.props.contactData.gender === 'm') gender = 'Männlich';
            else if (this.props.contactData.gender === 'w') gender = 'Weiblich';

            // show edit button if user is owner of contact or an admin
            const editButton = (this.props.contactData.ownerId === this.props.username || this.props.userRole === 'admin')
                ? <input className='contact-button' type='button' onClick={() => { this.props.showContactForm(this.props.contactData); }} value='bearbeiten' />
                : undefined;

            return (
                <div className='contact-hidden'>
                    <b>Geschlecht: {gender}</b><br />
                    <b>Titel: {this.props.contactData.title}</b><br />
                    <b>Straße: {this.props.contactData.street}</b><br />
                    <b>PLZ: {this.props.contactData.pc}</b><br />
                    <b>Stadt: {this.props.contactData.city}</b><br />
                    <b>Land: {this.props.contactData.country}</b><br />
                    <b>Privat: <input type='checkbox' disabled={true} checked={this.props.contactData.private} /></b><br />
                    <b>Email: {this.props.contactData.email}</b><br />
                    {editButton}
                    <input className='contact-button' type='button' onClick={() => { this.props.setMapPosition(this.props.contactData.geoCoord, 16); }} value='finden' style={{ marginLeft: '10px' }} />
                </div>
            )
        }
    }
}

Contact.propTypes = {
    contactData: PropTypes.object.isRequired,
    username: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    showContactForm: PropTypes.func.isRequired,
    setMapPosition: PropTypes.func.isRequired
}

export default React.memo(Contact);