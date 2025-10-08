import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faDownload, faTrash, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import api from '../../api';
import Swal from 'sweetalert2';

const Container = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 10px;
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  color: white;
  background-color: #3498db;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #2980b9;
  }
`;

const FileList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const FileCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FileIcon = styled.div`
  font-size: 3rem;
  color: #3498db;
  margin-bottom: 15px;
`;

const FileName = styled.p`
  font-weight: bold;
  word-break: break-all;
  margin: 0 0 10px 0;
`;

const FileActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #555;
  transition: color 0.3s;
  &:hover {
    color: ${props => props.color || '#3498db'};
  }
`;

const SecureFileSafe = () => {
    const [files, setFiles] = useState([]);

    const fetchFiles = useCallback(async () => {
        try {
            const response = await api.get('/files');
            setFiles(response.data);
        } catch (error) {
            Swal.fire('Error', 'Could not fetch your files.', 'error');
        }
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    const handleUpload = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Upload a New File',
            html:
                '<input id="swal-file" type="file" class="swal2-file" style="margin: 1em;">' +
                '<input id="swal-filename" class="swal2-input" placeholder="Enter a filename (optional)">' +
                '<input id="swal-pin" type="password" class="swal2-input" placeholder="Create a 4-digit PIN">',
            focusConfirm: false,
            preConfirm: () => {
                const file = document.getElementById('swal-file').files[0];
                const fileName = document.getElementById('swal-filename').value;
                const pin = document.getElementById('swal-pin').value;
                return { file, fileName, pin };
            }
        });
    
        if (formValues) {
            const { file, fileName, pin } = formValues;
            if (file && pin && /^\d{4}$/.test(pin)) {
                const formData = new FormData();
                // Use custom filename if provided, otherwise use the original file name
                const finalFileName = fileName.trim() || file.name;
                // The backend needs to know the original file name for content type, etc.
                // We send the file object which contains this info.
                formData.append('file', file, finalFileName);
                formData.append('pin', pin);
    
                try {
                    await api.post('/files/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    Swal.fire('Success!', 'File uploaded successfully.', 'success');
                    fetchFiles();
                } catch (error) {
                    Swal.fire('Upload Failed', 'There was an error uploading your file.', 'error');
                }
            } else {
                Swal.fire('Invalid Input', 'Please select a file and enter a valid 4-digit PIN.', 'error');
            }
        }
    };
    

    const handleDownload = async (fileId) => {
        const { value: pin } = await Swal.fire({
            title: 'Enter PIN to Download',
            input: 'password',
            inputPlaceholder: 'Enter your 4-digit PIN',
            inputAttributes: {
                maxLength: 4,
                autocapitalize: 'off',
                autocorrect: 'off'
            },
            showCancelButton: true
        });

        if (pin) {
            try {
                const response = await api.post(`/files/download/${fileId}`, { pin }, { responseType: 'blob' });
                const file = files.find(f => f.id === fileId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', file.fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                Swal.fire('Download Failed', 'Incorrect PIN or file not found.', 'error');
            }
        }
    };

    return (
        <Container>
            <PageTitle>Secure File Safe</PageTitle>
            <Controls>
                <Button onClick={handleUpload}><FontAwesomeIcon icon={faUpload} /> Upload File</Button>
            </Controls>
            <FileList>
                {files.map(file => (
                    <FileCard key={file.id}>
                        <FileIcon><FontAwesomeIcon icon={faFileAlt} /></FileIcon>
                        <FileName>{file.fileName}</FileName>
                        <FileActions>
                            <ActionButton onClick={() => handleDownload(file.id)} title="Download">
                                <FontAwesomeIcon icon={faDownload} />
                            </ActionButton>
                        </FileActions>
                    </FileCard>
                ))}
            </FileList>
        </Container>
    );
};

export default SecureFileSafe;

