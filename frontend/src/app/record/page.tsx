import './Records.scss';
//id = 1;
const Record = () => (
  <div className="main-container">

    <div className="details">

      <div className="history">
        <div className = "chief_Complaint">
          <strong><h2>Chief Complaint</h2></strong>
          <h2>Copy All</h2>
        </div>
        <h3>History</h3><br/>
        <h3>Assessment & Plan</h3><br/>
        <h3>Review of Systems</h3><br/>
        {/* Content related to history goes here */}
      </div>

      <div className="transcript">
        <button>Transcript</button><br/>
        <button>Noteworthy</button>
        {/* Content related to the transcript goes here */}
      </div>
      
    </div>
    <audio controls className="audio" />
  </div>
);

export default Record;
