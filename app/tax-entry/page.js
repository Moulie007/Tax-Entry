'use client';

import { useState, useEffect } from 'react';

export default function TaxEntry() {
  const [formData, setFormData] = useState({
    taxCode: '',
    taxName: '',
    taxValue: '',
    typeCode: '',
    category: '',
    valueType: 'Calculable',
    ledgerName: '',
  });

  const [taxEntries, setTaxEntries] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch tax entries from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/tax-entry');
      const data = await response.json();
      setTaxEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setTaxEntries([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // ✅ Prevent saving empty fields
    if (!formData.taxCode || !formData.taxName || !formData.taxValue || !formData.typeCode || !formData.category || !formData.ledgerName) {
      setErrorMessage('All fields are required.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const response = await fetch('/api/tax-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isEditing }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message);
        fetchData();
        resetForm();
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Failed to save tax entry.');
    }

    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  const handleEdit = (entry) => {
    setFormData(entry);
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      taxCode: '',
      taxName: '',
      taxValue: '',
      typeCode: '',
      category: '',
      valueType: 'Calculable',
      ledgerName: '',
    });
    setIsEditing(false);
  };

  return (
    <div className="container text-center mt-4">
      <h1 className="mb-4">Tax Entry</h1>
  

      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <form className="bg-light p-4 rounded shadow-sm">
        <div className="row g-2">
          <div className="col-md-6">
            <label className="form-label">Tax Code</label>
            <input type="text" name="taxCode" value={formData.taxCode} onChange={handleChange} className="form-control" required disabled={isEditing}/>
          </div>
          <div className="col-md-6">
            <label className="form-label">Tax Name</label>
            <input type="text" name="taxName" value={formData.taxName} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Tax Value</label>
            <input type="number" name="taxValue" value={formData.taxValue} onChange={handleChange} className="form-control" required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Type Code</label>
            <select name="typeCode" value={formData.typeCode} onChange={handleChange} className="form-select" required>
              <option value="">--Select--</option>
              <option value="add">Add</option>
              <option value="sub">Subtract</option>
              <option value="%">%</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select name="category" value={formData.category} onChange={handleChange} className="form-select" required>
              <option value="">--Select--</option>
              <option value="CGST">CGST</option>
              <option value="IGST">IGST</option>
              <option value="SGST">SGST</option>
              <option value="CESS">CESS</option>
              <option value="Custom Duty">Custom Duty</option>
              <option value="TCS">TCS</option>
              <option value="SWS">SWS</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Value Type</label>
            <div className="d-flex justify-content-center gap-3">
              <div className="form-check">
                <input type="radio" name="valueType" value="User" checked={formData.valueType === 'User'} onChange={handleChange} className="form-check-input" />
                <label className="form-check-label">User</label>
              </div>
              <div className="form-check">
                <input type="radio" name="valueType" value="Calculable" checked={formData.valueType === 'Calculable'} onChange={handleChange} className="form-check-input" />
                <label className="form-check-label">Calculable</label>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Ledger Name</label>
            <select name="ledgerName" value={formData.ledgerName} onChange={handleChange} className="form-select">
              <option value="">--Select--</option>
              <option value="General Ledger">General Ledger</option>
              <option value="Export Sales">Export Sales</option>
            </select>
          </div>
        </div>
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button type="button" className="btn btn-success" onClick={handleSave}>
            {isEditing ? 'Update' : 'Save'}
          </button>
          <button type="button" className="btn btn-danger" onClick={resetForm}>Reset</button>
        </div>
      </form>

      <h2 className="mt-5">Tax Entries</h2>
      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>Tax Code</th>
            <th>Tax Name</th>
            <th>Value</th>
            <th>Type Code</th>
            <th>Value Type</th>
            <th>Category</th>
            <th>Ledger Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {taxEntries.map((entry) => (
            <tr key={entry.taxCode} onClick={() => handleEdit(entry)} style={{ cursor: 'pointer' }}>
              <td>{entry.taxCode}</td>
              <td>{entry.taxName}</td>
              <td>{entry.taxValue}</td>
              <td>{entry.typeCode}</td>
              <td>{entry.valueType}</td>
              <td>{entry.category}</td>
              <td>{entry.ledgerName}</td>
              <td>
                <button className="btn btn-warning btn-sm" onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
