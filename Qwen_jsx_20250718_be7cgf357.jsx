import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// Generate IDs
const generatePatientId = (name, contact) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const last4 = contact.slice(-4);
  const first4 = name.slice(0, 4).padEnd(4, 'X').toUpperCase();
  return `${year}-${last4}-${first4}`;
};

const generateDoctorId = (name, regNo) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const reg4 = regNo.slice(-4);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .padEnd(2, 'X');
  return `DOC-${year}${reg4}-${initials}`;
};

export default function App() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const fetchPatients = async () => {
    const { data } = await supabase.from('patients').select();
    setPatients(data || []);
  };

  const fetchDoctors = async () => {
    const { data } = await supabase.from('doctors').select();
    setDoctors(data || []);
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Orthonova Clinic</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Patient Registration */}
        <RegistrationForm
          title="Register Patient"
          fields={[
            { label: 'Full Name', name: 'name' },
            { label: 'Age', name: 'age' },
            { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
            { label: 'Contact Number', name: 'contactNumber' },
            { label: 'Address', name: 'address', type: 'textarea' },
          ]}
          onSubmit={async (formData) => {
            const patientId = generatePatientId(formData.name, formData.contactNumber);
            const { error } = await supabase.from('patients').insert({
              patient_id: patientId,
              name: formData.name,
              age: parseInt(formData.age),
              gender: formData.gender,
              contact_number: formData.contactNumber,
              address: formData.address,
            });
            if (!error) fetchPatients();
            return !error;
          }}
        />

        {/* Doctor Registration */}
        <RegistrationForm
          title="Register Doctor"
          fields={[
            { label: 'Full Name', name: 'name' },
            { label: 'Contact Number', name: 'contactNumber' },
            { label: 'Registration Number', name: 'registrationNumber' },
            { label: 'OPD Fees (INR)', name: 'opdFees' },
          ]}
          onSubmit={async (formData) => {
            const doctorId = generateDoctorId(formData.name, formData.registrationNumber);
            const { error } = await supabase.from('doctors').insert({
              doctor_id: doctorId,
              name: formData.name,
              contact_number: formData.contactNumber,
              registration_number: formData.registrationNumber,
              opd_fees: parseFloat(formData.opdFees),
            });
            if (!error) fetchDoctors();
            return !error;
          }}
        />
      </main>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4">Registered Patients</h2>
        <DataTable data={patients} columns={['patient_id', 'name', 'age', 'gender', 'contact_number']} />
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-semibold mb-4">Registered Doctors</h2>
        <DataTable data={doctors} columns={['doctor_id', 'name', 'contact_number', 'registration_number', 'opd_fees']} />
      </section>
    </div>
  );
}

// Reusable Form Component
function RegistrationForm({ title, fields, onSubmit }) {
  const [form, setForm] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await onSubmit(form)) {
      setSuccess(true);
      setForm({});
    } else {
      setError(true);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      {success && <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm">Saved successfully!</div>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm">Error saving data.</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={form[field.name] || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                value={form[field.name] || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              >
                <option value="">Select</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name={field.name}
                value={form[field.name] || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                required
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

// Reusable Table Component
function DataTable({ data, columns }) {
  if (!data.length) return <p className="text-sm text-gray-500">No data yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th key={col} className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                {col.replace('_', ' ').toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 text-sm text-gray-800">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}