import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './trousseauxList.css';
import poubellepng from '../../img/poubelle.png';
import sharepng from '../../img/share.png';
import refusepng from '../../img/refuse.png';
import acceptpng from '../../img/accept.png';
import { useNavigate } from 'react-router-dom';

const TrousseauxList = () => {
    let navigate = useNavigate();
    const [trousseaux, setTrousseaux] = useState([]);
    const [trousseauxWithMe, setTrousseauxWithMe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [shareModalIsOpen, setShareModalIsOpen] = useState(false);
    const [newTrousseauName, setNewTrousseauName] = useState('');
    const [newShareName, setNewShareName] = useState('');
    const [closingModal, setClosingModal] = useState(false);
    const [selectedTrousseau, setSelectedTrousseau] = useState(null);

    useEffect(() => {
        const fetchMyTrousseaux = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/trousseau/my-trousseaux', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setTrousseaux(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trousseaux:', error);
                alert(error.response.data.error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTrousseauxWithMe = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/trousseau/shared-with-me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setTrousseauxWithMe(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trousseaux with me:', error);
                alert(error.response.data.error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTrousseaux();
        fetchTrousseauxWithMe();
    }, [refresh]);

    const handleAddTrousseau = async () => {
        try {
            await axios.post('http://localhost:3001/api/trousseau/create', 
                { name: newTrousseauName }, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setNewTrousseauName('');
            setAddModalIsOpen(false);
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error adding trousseau:', error);
            alert(error.response.data.error);
        }
    };

    const handleDeleteTrousseau = async (id, event) => {
        event.stopPropagation();
        try {
            await axios.delete(`http://localhost:3001/api/trousseau/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error deleting trousseau:', error);
            alert(error.response.data.error);
        }
    };

    const handleShareTrousseau = async (id) => {
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

    const handleAcceptInvitation = async (id, event) => {
        event.stopPropagation();
        try {
            await axios.post(`http://localhost:3001/api/trousseau/${id}/accept-invitation`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error accepting invitation:', error);
            alert(error.response.data.error);
        }
    };

    const handleRefuseInvitation = async (id, event) => {
        event.stopPropagation();
        try {
            await axios.post(`http://localhost:3001/api/trousseau/${id}/refuse-invitation`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error refusing invitation:', error);
            alert(error.response.data.error);
        }
    };

    const handleCloseModal = (setModalState) => {
        setClosingModal(true);
        setTimeout(() => {
            setModalState(false);
            setClosingModal(false);
        }, 500); // Durée de l'animation de fermeture
    };

    const handleRedirect = (id) => {
        navigate(`/app/trousseaux/${id}`);
    };

    return (
        <>
            <div className='mytrousseaux'>
                <h1>Mes Trousseaux</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : trousseaux.length === 0 ? (
                    <p>No trousseaux found</p>
                ) : (
                    <>
                        <ul>
                            {trousseaux.map((trousseau, index) => (
                                <li className='onetrousseau' key={index} onClick={() => handleRedirect(trousseau._id)}>
                                    {trousseau.name}
                                    {trousseau.isShared && <span> (shared)</span>}
                                    <button onClick={(e) => { e.stopPropagation(); setShareModalIsOpen(true); setSelectedTrousseau(trousseau._id); }}><img src={sharepng} alt="Share" /></button>
                                    <button onClick={(e) => handleDeleteTrousseau(trousseau._id, e)}><img src={poubellepng} alt="Delete" /></button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <button onClick={() => setRefresh(!refresh)}>Actualiser</button>
                <button onClick={() => setAddModalIsOpen(true)}>Ajouter Trousseau</button>
                <Modal
                    isOpen={addModalIsOpen}
                    onRequestClose={() => handleCloseModal(setAddModalIsOpen)}
                    className={`ModalContent ${closingModal ? 'close' : ''}`}
                    overlayClassName="ModalOverlay"
                    contentLabel="Add Trousseau"
                >
                    <h2>Add New Trousseau</h2>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddTrousseau(); }}>
                        <label>
                            Name:
                            <input
                                type="text"
                                value={newTrousseauName}
                                onChange={(e) => setNewTrousseauName(e.target.value)}
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
                    <form onSubmit={(e) => { e.preventDefault(); handleShareTrousseau(selectedTrousseau); }}>
                        <label>
                            Name:
                            <input
                                type="name"
                                value={newShareName}
                                onChange={(e) => setNewShareName(e.target.value)}
                            />
                        </label>
                        <button type="submit">Share</button>
                        <button onClick={() => handleCloseModal(setShareModalIsOpen)}>Cancel</button>
                    </form>
                </Modal>
            </div>
            <div className='trousseauxsharedwithme'>
                <h1>Trousseaux Partagé avec moi</h1>
                {loading ? (
                    <p>Loading...</p>
                ) : trousseauxWithMe.length === 0 ? (
                    <p>No trousseaux found</p>
                ) : (
                    <>
                        <ul>
                            {trousseauxWithMe.map((trousseau, index) => (
                                <li className='onetrousseau' key={index} onClick={() => handleRedirect(trousseau._id)}>
                                    <p className={trousseau.invitation}>{trousseau.name}<span>{trousseau.invitation}</span><span className='permission'>{trousseau.permission}</span></p>
                                    <p>Propriétaire: {trousseau.owner}</p>
                                    {trousseau.invitation === 'pending' ? (
                                        <div className='choice'>
                                            <button className='accept' onClick={(e) => handleAcceptInvitation(trousseau._id, e)}><img src={acceptpng} alt="Accept" /></button>
                                            <button className='refuse' onClick={(e) => handleRefuseInvitation(trousseau._id, e)}><img src={refusepng} alt="Refuse" /></button>
                                        </div>
                                    ) : (
                                        <div className='choice'>
                                            <button className='leave' onClick={(e) => handleRefuseInvitation(trousseau._id, e)}><img src={refusepng} alt="Leave" /></button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                <button onClick={() => setRefresh(!refresh)}>Actualiser</button>
            </div>
        </>
    )
}

export default TrousseauxList;
