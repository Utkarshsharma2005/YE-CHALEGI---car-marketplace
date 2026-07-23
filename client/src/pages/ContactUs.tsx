import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && subject && message) {
      setSubmitted(true);
      setName('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 md:px-8 py-6 text-textMain">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">Contact Support</h2>
        <p className="text-xs text-textMuted mt-1 uppercase tracking-wider font-semibold">
          Reach out to our customer support desk
        </p>
        <div className="w-full border-t border-gray-200 my-4"></div>
      </div>

      <div className="pro-card p-6">
        {submitted ? (
          <div className="text-center py-8 space-y-4 font-semibold text-xs uppercase">
            <CheckCircle2 className="w-12 h-12 text-emeraldSuccess mx-auto animate-bounce" />
            <h4 className="font-bold text-lg text-emeraldSuccess">Message Transmitted</h4>
            <p className="text-textMuted normal-case font-normal leading-relaxed">
              Your inquiry has been successfully sent to our marketplace administrators.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="btn-outline px-4 py-2 uppercase font-bold text-xs"
            >
              Write New Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
            
            {/* Name */}
            <div className="space-y-1">
              <label className="block uppercase text-textMuted tracking-wider text-[10px]">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter full name"
                className="w-full pro-input px-3 py-2 text-xs"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="block uppercase text-textMuted tracking-wider text-[10px]">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="e.g. Bidding process inquiry"
                className="w-full pro-input px-3 py-2 text-xs"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="block uppercase text-textMuted tracking-wider text-[10px]">Message Details</label>
              <textarea 
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Describe your inquiry or support request..."
                className="w-full pro-input px-3 py-2 text-xs resize-none"
              />
            </div>

            {/* Submit */}
            <button 
              type="submit"
              className="w-full btn-indigo py-2.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5px]" /> Submit Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ContactUs;
