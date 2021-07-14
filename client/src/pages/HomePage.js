import React from 'react';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import Contact from '../components/Contact';
import ContactForm from '../components/ContactForm';
import API from '../utils/Api';

/**
 * @description Homepage for logged in users containing content including contacts and map. Also handles the contact logic for adding, editing and deleting contacts.
 */
export default class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            contacts: [],
            users: [],
            showAll: false,
            showContactForm: false,
            currentContact: null,
            errorLog: ''
        }

        // reference to instance of current map
        this.mapRef = React.createRef();

        this.getContacts = this.getContacts.bind(this);
        this.getUsers = this.getUsers.bind(this);
        this.addContact = this.addContact.bind(this);
        this.editContact = this.editContact.bind(this);
        this.deleteContact = this.deleteContact.bind(this);
        this.verifyContactData = this.verifyContactData.bind(this);
    }

    //////////////////////////////////////
    //        Contact Methods
    //////////////////////////////////////

    /**
     * @description Gets all contacts from database and saves, user relevant ones, in state.
     */
    getContacts() {
        Axios.get(API.CONTACTS, {
            headers: {
                'Userid': this.props.username,
                'Userrole': this.props.userRole,
                'Show-All': this.state.showAll
            }
        })
            .then(response => {
                this.setState({ contacts: response.data });
            })
            .catch(error => {
                console.log(error.response);
            });
    }

    /**
     * @description Gets all users from database for use in owner select menu of the contactform
     */
    getUsers() {
        Axios.get(API.USERS)
            .then(response => {
                this.setState({ users: response.data });
            })
            .catch(error => {
                console.log(error.response);
            });
    }

    /**
     * @description Asynchronous check if contact can be added and then makes api call to contact endpoint if successful.
     * 
     * @async
     * @param {object} contactData 
     */
    async addContact(contactData) {
        const newContact = await this.verifyContactData(contactData);
        if (newContact === null) return;

        // make axios post request to api contacts endpoint using contact data
        Axios.post(API.CONTACTS, newContact)
            .then(response => {
                if (response.status === 201) {
                    this.getContacts();
                    this.setState({ showContactForm: false, currentContact : null, errorLog: '' });
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' });
                }
            })
            .catch(error => {
                this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.response));
            });
    }

    /**
     * @description Asynchronous check if contact can be edited and then makes api call to contact endpoint if successful.
     * 
     * @async
     * @param {object} contactData 
     */
    async editContact(contactData) {
        const newContact = await this.verifyContactData(contactData);
        if (newContact === null) return;

        // second verification that user has permission to edit contact
        if (newContact.ownerId !== this.props.username && this.props.userRole !== 'admin') return;

        // make axios put request to api contacts endpoint using contact id and data
        Axios.put(API.CONTACTS + '/' + this.state.currentContact._id, newContact)
            .then(response => {
                if (response.status === 204) {
                    this.getContacts();
                    this.setState({ showContactForm: false, currentContact : null, errorLog: '' });
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' });
                }
            })
            .catch(error => {
                this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.response));
            });
    }

    /**
     * @description Check if contact can be deleted and then makes api call to contact endpoint.
     */
    deleteContact() {
        if (!window.confirm('Willst du diesen Kontakt wirklich löschen?')) return;

        // second verification that user has permission to delete contact
        if (this.state.currentContact.ownerId !== this.props.username && this.props.userRole !== 'admin') return;

        Axios.delete(API.CONTACTS + '/' + this.state.currentContact._id)
            .then(response => {
                if (response.status === 204) {
                    this.getContacts();
                    this.setState({ showContactForm: false, currentContact : null, errorLog: '' });
                } else {
                    this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' });
                }
            })
            .catch(error => {
                this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.responsee));
            });
    }

    /**
     * @description Asynchronously verifies that the contactData is in the correct format and adds geo-coordinates using the openstreetmap api to the data.
     * 
     * @async
     * @param {object} contactData
     * @returns {object} null when unsuccessful and object when verification completed
     */
    async verifyContactData(contactData) {
        // test if required non-location data is empty or has been type-changed
        if (contactData.ownerId === '' || contactData.name === '' || contactData.surname === '' || contactData.gender === '' || typeof contactData.private !== 'boolean') {
            this.setState({ errorLog: 'der Kontakt muss im richtigen Format angegeben werden!' });
            return null;
        }

        // check for email regex in accordance to RFC 5322 standard
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(contactData.email) && contactData.email !== '') {
            this.setState({ errorLog: 'die Email muss im richtigen Format angegeben werden!' });
            return null;
        }

        // url for api call using given location data
        let url = 'https://nominatim.openstreetmap.org/search?';
        url += 'street=' + contactData.street.replace(' ', '+') + '&';
        url += 'city=' + contactData.city.replace(' ', '+') + '&';
        url += 'country=' + contactData.country.replace(' ', '+') + '&';
        url += 'format=json&addressdetails=1';

        // send async get request to openstreetmap to check if location exists and get geo-coordinates if possible
        let success = false;

        await Axios.get(url)
            .then(response => {
                if (response.data.length === 0) this.setState({ errorLog: 'die Adresse muss eine real existierende sein!' });
                else {
                    contactData['geoCoord'] = [response.data[0].lat, response.data[0].lon];
                    success = true;
                }
            })
            .catch(error => {
                this.setState({ errorLog: 'ein Fehler ist aufgetreten, versuche es zu einem späteren Zeitpunkt erneut!' }, console.log(error.response));
            });

        if (success) return contactData;
        else return null;
    }

    //////////////////////////////////////
    //             Render
    //////////////////////////////////////

    render() {
        // display contact form for editing/adding contact when button was pressed
        const contactForm = (!this.state.showContactForm) ? undefined :
            <ContactForm
                contactData={this.state.currentContact}
                userData={this.state.users}
                username={this.props.username}
                userRole={this.props.userRole}
                hideContactForm={() => { this.setState({ showContactForm: false, currentContact: null }); }}
                addContact={this.addContact}
                editContact={this.editContact}
                deleteContact={this.deleteContact}
                errorLog={this.state.errorLog}
            />;

        return (
            <div>
                <div id='main-screen'>
                    <div className='main-container'>
                        {/* Bodyheader */}
                        <div className='main-container_header'>
                            <h1>WADWiSe20 Karte</h1>
                            <h2>Willkommen {this.props.username}</h2>
                            <input type='button' value='logout' onClick={this.props.logout} />
                        </div>

                        {/* Bodycontainer */}
                        <div className='body-container'>

                            {/* Contactcontainer */}
                            <div className='body-container_left'>
                                <div className='contact-header'>
                                    <h1>Kontakte</h1>
                                </div>

                                {/* List of contacts - dynamically created when loading the contacts from database */}
                                <div className='contact-container'>
                                    {this.state.contacts.map((contact, index) =>
                                        <Contact
                                            key={index}
                                            contactData={contact}
                                            username={this.props.username}
                                            userRole={this.props.userRole}
                                            showContactForm={(contactData) => { this.setState({ showContactForm: true, currentContact: contactData }); }}
                                            setMapPosition={(position, zoom) => {
                                                this.mapRef.current.flyTo([position[0], position[1]], zoom, {
                                                    duration: 1
                                                });
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Add new Contacts Button */}
                                <div className='contact-options'>
                                    <input className='contact-button' type='button' onClick={() => { this.setState({ showAll: false }, () => { this.getContacts(); })}} value='meine Kontakte' />
                                    <input className='contact-button' type='button' onClick={() => { this.setState({ showAll: true }, () => { this.getContacts(); })}} value='alle Kontakte' />
                                    <input className='contact-button' type='button' onClick={() => { this.setState({ showContactForm: true, currentContact: null }); }} value='neuer kontakt' />
                                </div>
                            </div>

                            {/* Mapcontainer */}
                            <div className='body-container_right'>
                                <h2>Karte</h2>

                                <MapContainer
                                    className='map'
                                    whenCreated={ mapInstance => { this.mapRef.current = mapInstance } }
                                    center={[52.520645, 13.409779]}
                                    zoom={11}
                                    scrollWheelZoom={true}>
                                        <TileLayer
                                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                        />
                                        {this.state.contacts.map((contact, index) => {
                                            // attribution free svg marker-icon from https://orioniconlibrary.com/icon/pin-732?from=pack&name=location
                                            const svgIcon = `
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-labelledby="title" aria-describedby="desc" role="img" xmlns:xlink="http://www.w3.org/1999/xlink">
                                                    <title>Pin</title>
                                                    <desc>A solid styled icon from Orion Icon Library.</desc>
                                                    <path data-name="layer1" d="M32 2a20 20 0 0 0-20 20c0 18 20 40 20 40s20-22 20-40A20 20 0 0 0 32 2zm0 28a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" stroke="#000" stroke-width="2" fill="` + contact.color + `"></path>
                                                </svg>
                                            `;

                                            // create custom icon using color from contact and external svg
                                            var customIcon = new L.Icon({
                                                iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
                                                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                                iconSize: [33, 49],
                                                iconAnchor: [12, 41],
                                                popupAnchor: [4, -37],
                                                shadowSize: [41, 41]
                                            });

                                            // return marker with custom icon corresponding to current contact
                                            return (
                                                <Marker
                                                    key={index}
                                                    position={[contact.geoCoord[0], contact.geoCoord[1]]}
                                                    icon={customIcon}
                                                >
                                                    <Popup>{contact.surname}, {contact.name}</Popup>
                                                </Marker>
                                            )
                                        })}
                                </MapContainer>

                            </div>

                        </div>

                    </div>
                </div>
                {contactForm}
            </div>

        );
    };

    componentDidMount() {
        this.getContacts();
        if(this.props.userRole === 'admin') this.getUsers();
    }
}

HomePage.propTypes = {
    username: PropTypes.string.isRequired,
    userRole: PropTypes.string.isRequired,
    logout: PropTypes.func.isRequired
}