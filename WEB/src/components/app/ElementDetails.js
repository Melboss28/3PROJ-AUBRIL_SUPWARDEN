import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './elementDetails.css';
import editpng from '../../img/edit.png';
import backArrow from '../../img/backArrow.png';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../../_services/account.service';
import eyeIcon from '../../img/eye.png';
import eyeSlashIcon from '../../img/eye-slash.png';

const ElementDetails = () => {
    const { elementId } = useParams();
    const navigate = useNavigate();
    const { id } = useParams();
    const [element, setElement] = useState({});
    const [members, setMembers] = useState([]);
    const [owner, setOwner] = useState({});
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        uris: [],
        note: '',
        customFields: [],
        attachments: [],
        isSensitive: false
    });
    const [file, setFile] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchOneTrousseaux = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/trousseau/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setMembers(response.data.members);
                setOwner(response.data.owner);
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
                const response = await axios.get(`http://localhost:3001/api/element/${elementId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setElement(response.data);
                setFormData({
                    name: response.data.name,
                    username: response.data.username,
                    password: response.data.password,
                    uris: response.data.uris,
                    note: response.data.note || '',
                    customFields: response.data.customFields || [],
                    attachments: response.data.attachments || [],
                    isSensitive: response.data.isSensitive || false
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching element:', error);
                alert(error.response.data.error);
            }
        };

        fetchOneTrousseaux();
        fetchElement();
    }, [elementId, id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleArrayInputChange = (e, index, arrayName) => {
        const { value } = e.target;
        const newArray = [...formData[arrayName]];
        newArray[index] = value;
        setFormData({
            ...formData,
            [arrayName]: newArray
        });
    };

    const handleAddUri = () => {
        setFormData({
            ...formData,
            uris: [...formData.uris, '']
        });
    };

    const handleRemoveUri = (index) => {
        const newUris = formData.uris.filter((uri, i) => i !== index);
        setFormData({
            ...formData,
            uris: newUris
        });
    };

    const handleAddCustomField = () => {
        setFormData({
            ...formData,
            customFields: [...formData.customFields, { name: '', value: '', type: 'text' }]
        });
    };

    const handleRemoveCustomField = (index) => {
        const newCustomFields = formData.customFields.filter((field, i) => i !== index);
        setFormData({
            ...formData,
            customFields: newCustomFields
        });
    };

    const handleCustomFieldChange = (e, index) => {
        const { name, value } = e.target;
        const newCustomFields = [...formData.customFields];
        newCustomFields[index] = { ...newCustomFields[index], [name]: value };
        setFormData({
            ...formData,
            customFields: newCustomFields
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { attachments, ...dataToSend } = formData;

        try {
            const response = await axios.put(`http://localhost:3001/api/element/${elementId}`, dataToSend, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setElement(response.data);
            setEditing(false);
            setIsEditingName(false); // Reset editing state for name
            alert('Element updated successfully');
        } catch (error) {
            console.error('Error updating element:', error);
            alert(error.response.data.message);
        }
    };

    const handleToggleEditing = () => {
        setEditing(!editing);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAddAttachment = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('file', file);

        try {
            const response = await axios.post(`http://localhost:3001/api/element/${elementId}/attachments`, formDataToSend, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setElement(response.data);
            setFormData({ ...formData, attachments: response.data.attachments });
            setFile(null);
            alert('Attachment added successfully');
        } catch (error) {
            console.error('Error adding attachment:', error);
            alert(error.response.data.message);
        }
    };

    const handleRemoveAttachment = async (attachmentId) => {
        try {
            const response = await axios.delete(`http://localhost:3001/api/element/${elementId}/attachments/${attachmentId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setElement(response.data);
            setFormData({ ...formData, attachments: response.data.attachments });
            alert('Attachment removed successfully');
        } catch (error) {
            console.error('Error removing attachment:', error);
            alert(error.response.data.message);
        }
    };

    const handleEditName = () => {
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        try {
            const response = await axios.put(`http://localhost:3001/api/element/${elementId}`, { name: formData.name }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setElement(response.data);
            setIsEditingName(false);
            alert('Name updated successfully');
        } catch (error) {
            console.error('Error updating name:', error);
            alert(error.response.data.message);
        }
    };

    return (
        <>
            <div className='back' onClick={() => navigate(`/app/trousseaux/${id}`)}>
                <img src={backArrow} className='icon' alt="Back" />
                <p>Liste Elements</p>
            </div>
            <div className="element-details-container">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div>
                        {isEditingName ? (
                            <div className="name-edit">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                <button onClick={handleSaveName}>Save</button>
                                <button onClick={() => setIsEditingName(false)}>Cancel</button>
                            </div>
                        ) : (
                            <div className="name-display">
                                <h1>{element.name}</h1>
                                {(owner._id === accountService.getTokenInfo().userId) ||
                                (members.some(member => member.user._id === accountService.getTokenInfo().userId && member.permissions.includes('edit'))) ? (
                                <img onClick={handleEditName} src={editpng} className='icon' alt="edit" />
                                ) : null}
                            </div>
                        )}

                        {editing ? (
                            <form onSubmit={handleSubmit} className="element-form">
                                <h3>Username</h3>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} />

                                <h3>Password</h3>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} />

                                <h3>URIs</h3>
                                {formData.uris.map((uri, index) => (
                                    <div key={index} className="uri-field">
                                        <input
                                            type="text"
                                            value={uri}
                                            onChange={(e) => handleArrayInputChange(e, index, 'uris')}
                                        />
                                        <button type="button" onClick={() => handleRemoveUri(index)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddUri}>Add URI</button>

                                <h3>Note</h3>
                                <textarea name="note" value={formData.note} onChange={handleInputChange} />

                                <h3>Custom Fields</h3>
                                {formData.customFields.map((field, index) => (
                                    <div key={index} className="custom-field">
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Field Name"
                                            value={field.name}
                                            onChange={(e) => handleCustomFieldChange(e, index)}
                                        />
                                        <input
                                            type="text"
                                            name="value"
                                            placeholder="Field Value"
                                            value={field.value}
                                            onChange={(e) => handleCustomFieldChange(e, index)}
                                        />
                                        <select
                                            name="type"
                                            value={field.type}
                                            onChange={(e) => handleCustomFieldChange(e, index)}
                                        >
                                            <option value="text">Text</option>
                                            <option value="password">Password</option>
                                        </select>
                                        <button type="button" onClick={() => handleRemoveCustomField(index)}>Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddCustomField}>Add Custom Field</button>

                                <h3>Sensitive</h3>
                                <input
                                    type="checkbox"
                                    name="isSensitive"
                                    checked={formData.isSensitive}
                                    onChange={() => setFormData({ ...formData, isSensitive: !formData.isSensitive })}
                                />

                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={handleToggleEditing}>Cancel</button>
                            </form>
                        ) : (
                            <div>
                                <div className="details-item">
                                    <h3>Username</h3>
                                    <p>{element.username || "No username available"}</p>
                                </div>

                                <div className="details-item">
                                    <h3>Password</h3>
                                    <div className="password-field">
                                        <p>{element.password ? (showPassword ? element.password : '●●●●●●●●') : 'No password available'}</p>
                                        {element.password && (
                                            <img
                                                src={showPassword ? eyeSlashIcon : eyeIcon}
                                                alt={showPassword ? "Hide password" : "Show password"}
                                                className="eye-icon"
                                                onClick={() => setShowPassword(!showPassword)}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="details-item">
                                    <h3>URIs</h3>
                                    {element.uris && element.uris.length > 0 ? (
                                        <ul>
                                            {element.uris.map((uri, index) => (
                                                <li key={index}>{uri}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No URIs available</p>
                                    )}
                                </div>

                                <div className="details-item">
                                    <h3>Note</h3>
                                    <p>{element.note || "No note available"}</p>
                                </div>

                                <div className="details-item">
                                    {element.customFields && element.customFields.length > 0 ? (
                                        <div>
                                            {element.customFields.map((field, index) => (
                                                <div key={index}>
                                                    <h3>{field.name}:</h3>
                                                    <p>{field.value} ({field.type})</p>  
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p></p>
                                    )}
                                </div>

                                <div className="details-item">
                                    <h3>Sensitive</h3>
                                    <p>{element.isSensitive ? "Yes" : "No"}</p>
                                </div>

                                {(owner._id === accountService.getTokenInfo().userId) ||
                                (members.some(member => member.user._id === accountService.getTokenInfo().userId && member.permissions.includes('edit'))) ? (
                                <button onClick={handleToggleEditing}>Edit</button>
                                ) : null}
                            </div>
                        )}

                        <div className="attachment-management">
                            <h3>Pièces Jointes</h3>
                            {(owner._id === accountService.getTokenInfo().userId) ||
                                (members.some(member => member.user._id === accountService.getTokenInfo().userId && member.permissions.includes('edit'))) ? (
                            <>
                            <input type="file" onChange={handleFileChange} />
                            <button type="button" onClick={handleAddAttachment}>Add Attachment</button>
                            </>
                            ) : null}
                            {formData.attachments.length > 0 && (
                                <ul>
                                    {formData.attachments.map((attachment, index) => (
                                        <li key={index}>
                                            <a href={`http://localhost:3001/api/element/file/${attachment.filename}`} target="_blank" rel="noopener noreferrer">
                                                {attachment.filename}
                                            </a>
                                            <button type="button" onClick={() => handleRemoveAttachment(attachment._id)}>Remove</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {formData.attachments.length === 0 && (
                                <p>No attachments available</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ElementDetails;
