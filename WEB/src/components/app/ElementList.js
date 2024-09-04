import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import './elementList.css';
import poubellepng from '../../img/poubelle.png';
import sharepng from '../../img/share.png';
import addpng from '../../img/add.png';
import refreshpng from '../../img/refresh.png';
import backArrow from '../../img/backArrow.png';
import SensitiveElementModal from './SensitiveElementModal';
import cadenapng from '../../img/cadena.png';
import groupepng from '../../img/groupe.png';
import crownpng from '../../img/crown.png';
import { accountService } from '../../_services/account.service';
import TrousseauxChatApp from './TrousseauxChatApp';

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
    const [showSensitiveModal, setShowSensitiveModal] = useState(false);
    const [selectedElement, setSelectedElement] = useState(null);
    const [groupModalIsOpen, setGroupModalIsOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [owner, setOwner] = useState('');
    const [errorAdd, setErrorAdd] = useState('');
    const [errorShare, setErrorShare] = useState('');
    const [currentUserPermission, setCurrentUserPermission] = useState('');


    useEffect(() => {
        const fetchOneTrousseaux = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/trousseau/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setTrousseau(response.data);
                setMembers(response.data.members);
                setOwner(response.data.owner);
                // Find the current user's permission
                const currentUser = accountService.getTokenInfo().userId;
                const currentMember = response.data.members.find(member => member.user._id === currentUser);

                if (currentMember) {
                    setCurrentUserPermission(currentMember.permissions);
                } else if (response.data.owner._id === currentUser) {
                    setCurrentUserPermission('owner'); // The current user is the owner
                }
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
    }, [refresh,id]);

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
            setErrorAdd(error.response.data.error);
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
            setErrorShare(error.response.data.error);
        }
    };

    const filteredElements = elements.filter(element => 
        (element.name && element.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (element.username && element.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (element.uris && element.uris.some(uri => uri.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleElementClick = (element) => {
        if (element.isSensitive) {
            setSelectedElement(element);
            setShowSensitiveModal(true);
        } else {
            navigate(`/app/trousseaux/${id}/element/${element._id}`);
        }
    };

    const handlePermissionChange = async (memberId, newPermission) => {
        try {
            await axios.put(`http://localhost:3001/api/trousseau/${id}/member/${memberId}/permissions`, 
                { permissions: newPermission }, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error updating permissions:', error);
            alert(error.response.data.message);
        }
    };
    
    const handleRemoveMember = async (memberId) => {
        try {
            await axios.delete(`http://localhost:3001/api/trousseau/${id}/member/${memberId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error removing member:', error);
            alert(error.response.data.message);
        }
    };    

    return (
        <>
            <div>
                <div className='buttonBar'>
                    <div className='back' onClick={() => navigate('/app/trousseaux')}>
                        <img src={backArrow} className='icon' alt="Back" />
                        <p>Trousseaux</p>
                    </div>
                    <h1>{trousseau.name} - {currentUserPermission}</h1>
                    {(owner._id === accountService.getTokenInfo().userId) ||
                        (members.some(member => member.user._id === accountService.getTokenInfo().userId && member.permissions.includes('edit'))) ? (
                    <>
                    <img onClick={() => setAddModalIsOpen(true)} src={addpng} className='icon' alt="Add" />
                    <img onClick={() => setShareModalIsOpen(true)} src={sharepng} className='icon' alt="Share" />
                    </>
                    ) : null}
                    <img onClick={() => setGroupModalIsOpen(true)} src={groupepng} className='icon' alt="Group" title='Utilisateurs'/>
                    <img onClick={() => setRefresh(!refresh)} src={refreshpng} className='icon' alt="Refresh" title='Actualiser'/>
                    <TrousseauxChatApp/>
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
                        {errorAdd && <p style={{ color: 'red' }}>{errorAdd}</p>}
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
                        {errorShare && <p style={{ color: 'red' }}>{errorShare}</p>}
                    </form>
                </Modal>
                <Modal
                    isOpen={groupModalIsOpen}
                    onRequestClose={() => handleCloseModal(setGroupModalIsOpen)}
                    className={`ModalContent ${closingModal ? 'close' : ''}`}
                    overlayClassName="ModalOverlay"
                    contentLabel="Group Members"
                >
                    <h2>Group Members</h2>
                    <div className="memberTableContainer">
                        <table className="memberTable">
                            <thead>
                                <tr>
                                    <th>Pseudo</th>
                                    <th>Permission</th>
                                    <th>Invitation Status</th>
                                    {owner._id === accountService.getTokenInfo().userId && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{owner.pseudo}</td>
                                    <td>
                                        <img className='icon' src={crownpng} alt="Owner" />
                                    </td>
                                    <td>-</td>
                                    {owner._id === accountService.getTokenInfo().userId && <td>-</td>}
                                </tr>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan="3">No members found</td>
                                    </tr>
                                ) : (
                                    members.map((member, index) => (
                                        <tr key={index}>
                                            <td>{member.user.pseudo}</td>
                                            <td>
                                                {trousseau.owner._id === accountService.getTokenInfo().userId ? (
                                                    <select 
                                                        value={member.permissions} 
                                                        onChange={(e) => handlePermissionChange(member.user._id, e.target.value)}
                                                    >
                                                        <option value="read">Read</option>
                                                        <option value="edit">Edit</option>
                                                    </select>
                                                ) : (
                                                    member.permissions
                                                )}
                                            </td>
                                            <td>{member.invitation}</td>
                                            {owner._id === accountService.getTokenInfo().userId && (
                                                <td>
                                                    <button className="deleteButton" onClick={() => handleRemoveMember(member.user._id)}><img className="icon" src={poubellepng} alt="Delete" /></button>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button onClick={() => handleCloseModal(setGroupModalIsOpen)}>Close</button>
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
                            onClick={() => handleElementClick(element)}
                        >
                            <p>{element.name}{element.isSensitive && <img className='icon' src={cadenapng} alt="cadena"/>}</p>
                            <p className='detail'>{element.username}</p>
                            {owner._id === accountService.getTokenInfo().userId && 
                            <button className="deleteButton" onClick={(e) => {e.stopPropagation(); handleDeleteElement(element._id);}}>
                                <img className="icon" src={poubellepng} alt="Delete" />
                            </button>}
                        </div>
                    ))}
                </div>
            )}
            {showSensitiveModal && selectedElement && (
                <SensitiveElementModal 
                    element={selectedElement} 
                    onClose={(isPinValid) => {
                        if (isPinValid) {
                            navigate(`/app/trousseaux/${id}/element/${selectedElement._id}`);
                        }
                        setShowSensitiveModal(false);
                        setSelectedElement(null);
                    }} 
                />
            )}
        </>
    );
};

export default ElementList;
