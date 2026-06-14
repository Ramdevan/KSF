import React from 'react';
import { Calendar } from 'lucide-react';

const DateInput = ({ value, onChange, className = '', required = false, name = '', min, max }) => {
    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    const formatDateForDisplay = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                readOnly
                value={formatDateForDisplay(value)}
                className={`form-input cursor-pointer pr-10 ${className}`}
                placeholder="dd/mm/yyyy"
            />
            <input
                type="date"
                name={name}
                required={required}
                value={value}
                onChange={onChange}
                min={min}
                max={max}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <Calendar className="w-4 h-4" />
            </div>
        </div>
    );
};

export default DateInput;
