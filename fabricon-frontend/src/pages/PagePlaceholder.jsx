import { FaTools } from 'react-icons/fa';

export function PagePlaceholder({ title, description }) {
  return (
    <div className="fc-placeholder">
      <FaTools className="fc-placeholder__icon" aria-hidden="true" />
      <h2 className="fc-placeholder__title">{title}</h2>
      <p className="fc-placeholder__text">
        {description || 'This module is under development and will be available in the next phase.'}
      </p>
    </div>
  );
}
