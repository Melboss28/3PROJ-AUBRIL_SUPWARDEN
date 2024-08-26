import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import './elementList.css';
import poubellepng from '../../img/poubelle.png';
import sharepng from '../../img/share.png';
import addpng from '../../img/add.png';
import refreshpng from '../../img/refresh.png';
import backArrow from '../../img/backArrow.png'; // Import your back arrow image

const ElementList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trousseau, setTrousseau] = useState({});
    const [loading, setLoading] = useState(true);
    const [elements, setElements] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [newElementName, setNewElementName] = useState('');
    const [closingModal, setClosingModal] = useState(false);
    const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
    const [newShareName, setNewShareName] = useState('');

    useEffect(() => {
        const fetchOneTrousseaux = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/trousseau/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setTrousseau(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trousseaux:', error);
                alert(error.response.data.error);
            } finally {
                setLoading(false);
            }
        };

        const fetchElement = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/element/trousseau/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setElements(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching elements:', error);
                alert(error.response.data.error);
            } finally {
                setLoading(false);
            }
        };

        fetchOneTrousseaux();
        fetchElement();
    }, [refresh]);

    const handleAddElement = async () => {
        try {
            await axios.post(`http://localhost:3001/api/element/trousseau/${id}`, 
                { name: newElementName }, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setNewElementName('');
            setAddModalIsOpen(false);
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error adding element:', error);
            alert(error.response.data.error);
        }
    };

    const handleDeleteElement = async (element_id) => {
        try {
            await axios.delete(`http://localhost:3001/api/element/${element_id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error deleting element:', error);
            alert(error.response.data.error);
        }
    };

    const handleCloseModal = (setModalState) => {
        setClosingModal(true);
        setTimeout(() => {
            setModalState(false);
            setClosingModal(false);
        }, 500);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleShareTrousseau = async () => {
        try {
            await axios.post(`http://localhost:3001/api/trousseau/${id}/add-member`, 
                { name: newShareName }, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setNewShareName('');
            setShareModalIsOpen(false);
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error sharing trousseau:', error);
            alert(error.response.data.error);
        }
    };

    const filteredElements = elements.filter(element => 
        (element.name && element.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (element.username && element.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (element.uris && element.uris.some(uri => uri.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <>
            <div>
                <div className='buttonBar'>
                    <div className='back' onClick={() => navigate('/app/trousseaux')}>
                        <img src={backArrow} className='icon' alt="Back" />
                        <p>Trousseaux</p>
                    </div>
                    <h1>{trousseau.name}</h1>
                    <img onClick={() => setAddModalIsOpen(true)} src={addpng} className='icon' alt="Add" />
                    <img onClick={() => setShareModalIsOpen(true)} src={sharepng} className='icon' alt="Share" />
                    <img onClick={() => setRefresh(!refresh)} src={refreshpng} className='icon' alt="Refresh" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search elements..." 
                    value={searchTerm}
                    onChange={handleSearch}
                    className="searchInput"
                />
                <Modal
                    isOpen={addModalIsOpen}
                    onRequestClose={() => handleCloseModal(setAddModalIsOpen)}
                    className={`ModalContent ${closingModal ? 'close' : ''}`}
                    overlayClassName="ModalOverlay"
                    contentLabel="Add Element"
                >
                    <h2>Add New Element</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddElement(); }}>
                        <label>
                            Name:
                            <input
                                type="text"
                                value={newElementName}
                                onChange={(e) => setNewElementName(e.target.value)}
                            />
                        </label>
                        <button type="submit">Add</button>
                        <button onClick={() => handleCloseModal(setAddModalIsOpen)}>Cancel</button>
                    </form>
                </Modal>
                <Modal
                    isOpen={shareModalIsOpen}
                    onRequestClose={() => handleCloseModal(setShareModalIsOpen)}
                    className={`ModalContent ${closingModal ? 'close' : ''}`}
                    overlayClassName="ModalOverlay"
                    contentLabel="Share Trousseau"
                >
                    <h2>Share Trousseau</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleShareTrousseau(); }}>
                        <label>
                            Name:
                            <input
                                type="text"
                                value={newShareName}
                                onChange={(e) => setNewShareName(e.target.value)}
                            />
                        </label>
                        <button type="submit">Share</button>
                        <button onClick={() => handleCloseModal(setShareModalIsOpen)}>Cancel</button>
                    </form>
                </Modal>
            </div>
            {loading ? (
                <p>Loading...</p>
            ) : filteredElements.length === 0 ? (
                <p>No elements found</p>
            ) : (
                <div className="elementList">
                    {filteredElements.map((element, index) => (
                        <div 
                            className="elementItem" 
                            key={index}
                            onClick={() => navigate(`/app/trousseaux/${id}/element/${element._id}`)}
                        >
                            <p>{element.name}</p>
                            <p className='detail'>{element.username}</p>
                            <button className="deleteButton" onClick={(e) => {e.stopPropagation(); handleDeleteElement(element._id);}}>
                                <img className="icon" src={poubellepng} alt="Delete" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default ElementList;
