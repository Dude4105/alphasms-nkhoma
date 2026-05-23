import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  User, 
  MessageSquare, 
  School, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowLeft 
} from 'lucide-react';
import '../App.css';

export default function Apply() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    gender: 'Female',
    targetClass: 'Form 1',
    boardingStatus: 'Boarding',
    previousSchool: '',
    guardianTitle: 'Mr',
    guardianName: '',
    whatsapp: '',
    phone: '',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = async () => {
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:3000/enrollment/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to submit application');
        setCurrentStep(4);
      } catch (err) {
        alert('Failed to submit application. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const finishApplication = () => {
    navigate('/');
  };

  return (
    <div className="apply-page-overlay">
      <div className="glass-panel modal-container" style={{ margin: '4rem auto', minHeight: '600px' }}>
        <button 
          className="modal-close" 
          onClick={() => navigate('/')}
          title="Back to Home"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', left: '1.5rem', right: 'auto', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={18} /> Cancel
        </button>
        
        {/* Progress Bar */}
        <div className="modal-progress" style={{ marginTop: '2rem' }}>
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`progress-step ${currentStep >= step ? 'active' : ''}`}
            >
              <div className="step-number">{step}</div>
            </div>
          ))}
          <div className="progress-line" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
        </div>

        <div className="modal-content">
          {currentStep === 1 && (
            <div className="step-content animate-fade">
              <h2 className="step-title">Student Details</h2>
              <div className="form-group">
                <label>First Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange} 
                    placeholder="Enter first name"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Surname</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="surname" 
                    value={formData.surname} 
                    onChange={handleInputChange} 
                    placeholder="Enter surname"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label className={`radio-label ${formData.gender === 'Female' ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value="Female" checked={formData.gender === 'Female'} onChange={handleInputChange} /> Female
                  </label>
                  <label className={`radio-label ${formData.gender === 'Male' ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value="Male" checked={formData.gender === 'Male'} onChange={handleInputChange} /> Male
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="step-content animate-fade">
              <h2 className="step-title">Enrollment Class</h2>
              <div className="form-group">
                <label>Select Class</label>
                <div className="input-wrapper">
                  <BookOpen className="input-icon" size={18} />
                  <select name="targetClass" value={formData.targetClass} onChange={handleInputChange}>
                    <option value="Form 1">Form 1</option>
                    <option value="Form 2">Form 2</option>
                    <option value="Form 3">Form 3</option>
                    <option value="Form 4">Form 4</option>
                  </select>
                </div>
              </div>
              <div className="form-group animate-fade">
                <label>Scholar Type</label>
                <div className="radio-group">
                  <label className={`radio-label ${formData.boardingStatus === 'Boarding' ? 'selected' : ''}`}>
                    <input type="radio" name="boardingStatus" value="Boarding" checked={formData.boardingStatus === 'Boarding'} onChange={handleInputChange} /> Boarding
                  </label>
                  <label className={`radio-label ${formData.boardingStatus === 'Day' ? 'selected' : ''}`}>
                    <input type="radio" name="boardingStatus" value="Day" checked={formData.boardingStatus === 'Day'} onChange={handleInputChange} /> Day Scholar
                  </label>
                </div>
              </div>
              {formData.targetClass !== 'Form 1' && (
                <div className="form-group animate-fade">
                  <label>Old School Name</label>
                  <div className="input-wrapper">
                    <School className="input-icon" size={18} />
                    <input 
                      type="text" 
                      name="previousSchool" 
                      value={formData.previousSchool} 
                      onChange={handleInputChange} 
                      placeholder="Enter previous school name"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="step-content animate-fade">
              <h2 className="step-title">Guardian Details</h2>
              <div className="form-group">
                <label>Title</label>
                <div className="radio-group">
                  <label className={`radio-label ${formData.guardianTitle === 'Mr' ? 'selected' : ''}`}>
                    <input type="radio" name="guardianTitle" value="Mr" checked={formData.guardianTitle === 'Mr'} onChange={handleInputChange} /> Mr
                  </label>
                  <label className={`radio-label ${formData.guardianTitle === 'Ms' ? 'selected' : ''}`}>
                    <input type="radio" name="guardianTitle" value="Ms" checked={formData.guardianTitle === 'Ms'} onChange={handleInputChange} /> Ms
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="guardianName" 
                    value={formData.guardianName} 
                    onChange={handleInputChange} 
                    placeholder="Enter guardian full name"
                  />
                </div>
              </div>
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>WhatsApp Number</label>
                  <div className="input-wrapper">
                    <MessageSquare className="input-icon" size={18} />
                    <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="+265..." />
                  </div>
                </div>
                <div className="form-group">
                  <label>Calls Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+265..." />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-content animate-fade text-center">
              <div className="confirmation-icon">
                <CheckCircle size={64} color="var(--primary-gold)" />
              </div>
              <h2 className="step-title">Confirmation</h2>
              <div className="summary-box glass-panel">
                <p><strong>Student:</strong> {formData.firstName} {formData.surname} ({formData.gender})</p>
                <p><strong>Enrollment:</strong> {formData.targetClass} - {formData.boardingStatus}</p>
                <p><strong>Guardian:</strong> {formData.guardianTitle}. {formData.guardianName}</p>
              </div>
              <p className="confirmation-msg">
                Thank you for your interest! You will be contacted regarding enrollment on the contact details provided.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={finishApplication}>
                Finish & Return
              </button>
            </div>
          )}
        </div>

        {currentStep < 4 && (
          <div className="modal-footer">
            {currentStep > 1 && (
              <button className="btn btn-outline" onClick={prevStep}>Back</button>
            )}
            <button 
              className="btn btn-primary" 
              style={{ marginLeft: 'auto' }} 
              onClick={nextStep}
              disabled={isSubmitting}
            >
              {currentStep === 3 ? (isSubmitting ? 'Submitting...' : 'Submit Enrollment') : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
