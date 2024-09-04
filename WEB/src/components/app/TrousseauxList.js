import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './trousseauxList.css';
import poubellepng from '../../img/poubelle.png';
import sharepng from '../../img/share.png';
import refusepng from '../../img/refuse.png';
import acceptpng from '../../img/accept.png';
import { useNavigate } from 'react-router-dom';
import groupepng from '../../img/groupe.png';
import exportpng from '../../img/export.png';
import importpng from '../../img/import.png';

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
    const [userPseudos, setUserPseudos] = useState({});
    const [importModalIsOpen, setImportModalIsOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [errorMy, setErrorMy] = useState('');
    const [errorWm, setErrorWm] = useState('');
    const [errorShare, setErrorShare] = useState('');
    const [errorAdd, setErrorAdd] = useState('');
    const [errorImport, setErrorImport] = useState('');

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
                setErrorMy(error.response.data.error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTrousseauxWithMe = async () => {
            try {
                // Fetch trousseaux shared with me
                const response = await axios.get('http://localhost:3001/api/trousseau/shared-with-me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const trousseauxWithMeData = response.data;
    
                // Fetch pseudos for each owner
                const pseudos = {};
                for (const trousseau of trousseauxWithMeData) {
                    if (!pseudos[trousseau.owner]) {
                        const pseudo = await fetchUserPseudo(trousseau.owner);
                        pseudos[trousseau.owner] = pseudo;
                    }
                }
    
                setTrousseauxWithMe(trousseauxWithMeData);
                setUserPseudos(pseudos);
            } catch (error) {
                console.error('Error fetching trousseaux with me:', error);
                setErrorWm(error.response.data.error);
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
            setErrorAdd(error.response.data.error);
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
            setErrorMy(error.response.data.error);
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
            setErrorShare(error.response.data.error);
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
            setErrorWm(error.response.data.error);
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
            setErrorWm(error.response.data.error);
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

    const fetchUserPseudo = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/user/pseudo/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data.pseudo;
        } catch (error) {
            console.error('Error fetching user pseudo:', error);
            return 'Unknown'; // Fallback if there's an error
        }
    };

    const handleExport = async (format) => {
        try {
            const response = await axios.get(`http://localhost:3001/api/trousseau/transfer/export?format=${format}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `trousseaux_export.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting trousseaux:', error);
        }
    };

    const handleFileChange = (event) => {
        setImportFile(event.target.files[0]);
    };

    const handleImport = async () => {
        if (!importFile) {
            setErrorImport('Please select a file to import.');
            return;
        }

        const formData = new FormData();
        formData.append('file', importFile);

        try {
            await axios.post('http://localhost:3001/api/trousseau/transfer/import', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setImportFile(null);
            setImportModalIsOpen(false);
            setRefresh(!refresh);
        } catch (error) {
            console.error('Error importing file:', error);
            setErrorImport(error.response.data.error);
        }
    };

    return (
        <>
            <div className='mytrousseaux'>
                <h1>Mes Trousseaux
                    <button className='export-button' onClick={() => handleExport('json')}>
                        <img src={exportpng} alt="Export JSON" title="Exporter" />
                    </button>
                    {/* <button className='export-button' onClick={() => handleExport('csv')}>
                        <img src={exportpng} alt="Export CSV" title="Export as CSV" />
                    </button> */}
                    <button  className='export-button' onClick={() => setImportModalIsOpen(true)}>
                        <img src={importpng} alt="Import" title='Importer'/>
                    </button>
                </h1>
                {errorMy && <p style={{ color: 'red' }}>{errorMy}</p>}
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
                                    {trousseau.isShared && <img className='icon' src={groupepng} alt="groupe"/>}
                                    <button onClick={(e) => { e.stopPropagation(); setShareModalIsOpen(true); setSelectedTrousseau(trousseau._id); }}><img src={sharepng} alt="Share" title='Partager'/></button>
                                    <button onClick={(e) => handleDeleteTrousseau(trousseau._id, e)}><img src={poubellepng} alt="Delete" title='Supprimer'/></button>
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
                        {errorShare && <p style={{ color: 'red' }}>{errorShare}</p>}
                    </form>
                </Modal>
                <Modal isOpen={importModalIsOpen} onRequestClose={() => setImportModalIsOpen(false)}>
                <h2>Import Trousseaux</h2>
                    <input type="file" onChange={handleFileChange} />
                    {errorImport && <p style={{ color: 'red' }}>{errorImport}</p>}
                    <button onClick={handleImport}>Import</button>
                    <button onClick={() => setImportModalIsOpen(false)}>Cancel</button>
                </Modal>
            </div>
            <div className='trousseauxsharedwithme'>
                <h1>Trousseaux Partagé avec moi</h1>
                {errorWm && <p style={{ color: 'red' }}>{errorWm}</p>}
                {loading ? (
                    <p>Loading...</p>
                ) : trousseauxWithMe.length === 0 ? (
                    <p>No trousseaux found</p>
                ) : (
                    <>
                        <ul>
                            {trousseauxWithMe.map((trousseau, index) => (
                                <li className={`onetrousseau ${trousseau.invitation === 'pending' ? 'pending' : ''}`} key={index} onClick={trousseau.invitation !== 'pending' ? () => navigate(`/app/trousseaux/${trousseau._id}`) : undefined}>
                                    <p className={trousseau.invitation}>{trousseau.name}<span>{trousseau.invitation}</span></p>
                                    <p>Propriétaire: {userPseudos[trousseau.owner] || 'Loading...'}</p>
                                    {trousseau.invitation === 'pending' ? (
                                        <div className='choice'>
                                            <button className='accept' onClick={(e) => handleAcceptInvitation(trousseau._id, e)}><img src={acceptpng} alt="Accept" /></button>
                                            <button className='refuse' onClick={(e) => handleRefuseInvitation(trousseau._id, e)}><img src={refusepng} alt="Refuse" /></button>
                                        </div>
                                    ) : (
                                        <div className='choice'>
                                            <button className='leave' onClick={(e) => handleRefuseInvitation(trousseau._id, e)}><img src={refusepng} alt="Leave" title='Quitter'/></button>
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
