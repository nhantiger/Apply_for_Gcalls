import { useEffect, useState } from "react";
import JsSIP from "jssip";

const CallPage = () => {
  const [callStatus, setCallStatus] = useState("Initializing...");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const name = queryParams.get("name");

    try {
      const socket = new JsSIP.WebSocketInterface(
        "wss://gc03-pbx.tel4vn.com:7444"
      );
      const configuration = {
        sockets: [socket],
        uri: `sip:${name}@2-test4.gcalls.vn:50061`,
        password: "test1101",
      };
      const ua = new JsSIP.UA(configuration);
      ua.start();

      ua.on("registered", () => {
        setCallStatus("Registered...");
      });

      ua.on("unregistered", () => {
        setCallStatus("Unregistered...");
      });

      ua.on("registrationFailed", () => {
        setCallStatus("Registration failed...");
      });

      ua.on("newRTCSession", (data) => {
        const { session } = data;
        if (session.direction === "incoming") {
          setCallStatus("Incoming call...");
          if (!callInProgress) {
            // Tự động trả lời cuộc gọi đến
            session.answer();
          } else {
            // Từ chối cuộc gọi nếu đang có cuộc gọi khác đang diễn ra
            session.terminate();
          }
        }
      });
    } catch (error) {
      setCallStatus("Failed to connect to the SIP server");
    }

    return () => {
      ua.stop();
    };
  }, []);

  const handleCall = () => {
    if (!phoneNumber) {
      setCallStatus("Please enter a valid phone number");
      return;
    }

    try {
      setCallStatus(`Calling ${phoneNumber}...`);
      const socket = new JsSIP.WebSocketInterface(
        "wss://gc03-pbx.tel4vn.com:7444"
      );
      const configuration = {
        sockets: [socket],
        uri: `sip:${phoneNumber}@2-test4.gcalls.vn:50061`,
        password: "test1101",
      };
      const ua = new JsSIP.UA(configuration);
      ua.start();

      ua.on("connected", () => {
        setCallInProgress(true);
      });

      ua.on("ended", () => {
        setCallInProgress(false);
        setCallStatus("Call ended");
        ua.stop();
      });

      ua.on("failed", () => {
        setCallInProgress(false);
        setCallStatus("Call failed");
        ua.stop();
      });

      const options = {
        mediaConstraints: { audio: true, video: false },
      };
      ua.call(`sip:${phoneNumber}@2-test4.gcalls.vn:50061`, options);
    } catch (error) {
      setCallStatus("Failed to make the call");
    }
  };
  return (
    <div>
      <h1>Trang Gọi</h1>
      <p>Trạng thái: {callStatus}</p>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="Nhập số điện thoại"
      />
      <button onClick={handleCall}>Gọi</button>
    </div>
  );
};

export default CallPage;
