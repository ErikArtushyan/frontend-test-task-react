import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileDownloader = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/files');
        setFiles(response.data.map(file => ({
          ...file,
          progress: 0,
          downloaded: false,
          error: null
        })));
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const downloadFile = async (file) => {
    try {
      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, progress: 0, error: null } : f
      ));

      const response = await axios({
        url: file.url,
        method: 'GET',
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percent = progressEvent.total ? 
            Math.round((progressEvent.loaded * 100) / progressEvent.total) :
            0;
          setFiles(prev => prev.map(f => 
            f.name === file.name ? { ...f, progress: percent } : f
          ));
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, downloaded: true, progress: 100 } : f
      ));
    } catch (error) {
      console.error(`Error downloading ${file.name}:`, error);
      setFiles(prev => prev.map(f => 
        f.name === file.name ? { ...f, error: 'Download failed' } : f
      ));
    }
  };

  const downloadAllFiles = async () => {
    setLoading(true);
    try {
      await Promise.all(files.map(file => downloadFile(file)));
    } catch (error) {
      console.error('Error downloading files:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>File Downloader</h2>
      <button 
        onClick={downloadAllFiles} 
        disabled={loading}
        style={loading ? styles.buttonDisabled : styles.button}
      >
        {loading ? 'Downloading...' : 'Download All Files'}
      </button>

      <div style={styles.fileList}>
        {files.map((file) => (
          <div 
            key={file.name} 
            style={{
              ...styles.fileItem,
              backgroundColor: file.error ? '#ffebee' : 'transparent'
            }}
          >
            <span style={styles.fileName}>{file.name}</span>
            
            {file.downloaded ? (
              <span style={styles.successIcon}>✓</span>
            ) : file.error ? (
              <span style={styles.errorText}>Error</span>
            ) : (
              <div style={styles.progressContainer}>
                <progress 
                  value={file.progress} 
                  max="100" 
                  style={styles.progressBar}
                />
                <span>{file.progress}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif'
  },
  title: {
    textAlign: 'center',
    color: '#333'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'block',
    margin: '0 auto 20px'
  },
  buttonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    display: 'block',
    margin: '0 auto 20px'
  },
  fileList: {
    maxHeight: '400px', 
    overflowY: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px'
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    borderBottom: '1px solid #eee'
  },
  fileName: {
    flex: 1
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '200px',
    gap: '10px'
  },
  progressBar: {
    flex: 1
  },
  successIcon: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: '10px'
  },
  errorText: {
    color: '#f44336',
    marginLeft: '10px'
  }
};

export default FileDownloader;