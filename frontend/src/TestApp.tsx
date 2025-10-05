function TestApp() {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center', 
      backgroundColor: '#f3f4f6',
      minHeight: '100vh' 
    }}>
      <h1 style={{ 
        color: '#1f2937', 
        fontSize: '48px', 
        marginBottom: '24px' 
      }}>
        🎯 AI Interviewer Test
      </h1>
      <p style={{ 
        color: '#6b7280', 
        fontSize: '20px', 
        marginBottom: '32px',
        maxWidth: '600px',
        margin: '0 auto 32px'
      }}>
        If you can see this page, your React app is working correctly!
      </p>
      <button style={{ 
        backgroundColor: '#3b82f6', 
        color: 'white', 
        padding: '16px 32px', 
        border: 'none', 
        borderRadius: '8px',
        fontSize: '18px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        ✅ React is Working!
      </button>
      <div style={{ marginTop: '40px', color: '#9ca3af' }}>
        <p>Server: Vite + React</p>
        <p>Port: 3000</p>
        <p>Status: Running</p>
      </div>
    </div>
  );
}

export default TestApp;