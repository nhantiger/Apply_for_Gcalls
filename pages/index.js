import { useState, useEffect, useRef } from "react";
import {
  IoSettingsOutline,
  IoArrowForwardCircleOutline,
} from "react-icons/io5";
import * as JsSIP from "jssip";
import Switch from "react-switch";
import Webcam from "react-webcam";

export default function Home() {
  const [name, setName] = useState("");
  const [sipUrl, setSipUrl] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [websocketUrl, setWebsocketUrl] = useState("");
  const [viaTransport, setViaTransport] = useState("auto");
  const [registrarServer, setRegistrarServer] = useState("");
  const [contactUrl, setContactUrl] = useState("");
  const [authorizationUser, setAuthorizationUser] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const nameInputRef = useRef(null);
  const [sessionTimersEnabled, setSessionTimersEnabled] = useState(false);
  const [preloadedRouteEnabled, setPreloadedRouteEnabled] = useState(false);
  const [callStatsEnabled, setCallStatsEnabled] = useState(false);
  const [appid, setAppid] = useState("");
  const [appsecret, setAppsecret] = useState("");
  const [isCameraOn, setIsCameraOn] = useState(false);
  const renderWebcam = () => {
    if (isCameraOn) {
      return <Webcam />;
    } else {
      return null;
    }
  };
  const handleTurnOnCamera = () => {
    setIsCameraOn(true);
    setShowVideoCallOptions(false);
  };

  // CallPage state and logic
  const [callStatus, setCallStatus] = useState("Initializing...");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);
  const [allowPhoneNumberInput, setAllowPhoneNumberInput] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showRejectButton, setShowRejectButton] = useState(false);
  const [showEndCallButton, setShowEndCallButton] = useState(false);
  const [showVideoCallButton, setShowVideoCallButton] = useState(false);
  const [showVideoCallOptions, setShowVideoCallOptions] = useState(false);

  const [ua, setUa] = useState(null);
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const name = queryParams.get("name");
    let ua;
    const allowInput = sipUrl && sipPassword && websocketUrl;
    setAllowPhoneNumberInput(allowInput);

    try {
      const socket = new JsSIP.WebSocketInterface(
        "wss://gc03-pbx.tel4vn.com:7444"
      );
      const configuration = {
        sockets: [socket],
        uri: `sip:${name}@2-test4.gcalls.vn:50061`,
        password: "test1101",
      };
      ua = new JsSIP.UA(configuration);
      setUa(ua);

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
          setShowRejectButton(true); // Hiển thị nút "Từ chối" khi có cuộc gọi đến
          setShowEndCallButton(false);
          setShowVideoCallButton(false);
          if (!callInProgress) {
            // Tự động trả lời cuộc gọi đến
            session.answer();
          } else {
            // Từ chối cuộc gọi nếu đang có cuộc gọi khác đang diễn ra
            session.terminate();
          }
        }
      });

      ua.on("connected", () => {
        setCallInProgress(true);
        setShowRejectButton(false); // Ẩn nút "Từ chối" khi bắt đầu cuộc gọi
        setShowEndCallButton(true); // Hiển thị nút "Kết thúc cuộc gọi" và "Gọi video"
        setShowVideoCallButton(true);
      });

      ua.on("ended", () => {
        setCallInProgress(false);
        setCallStatus("Call ended");
        ua.stop();
        setShowEndCallButton(false);
        setShowVideoCallButton(false);
      });

      ua.on("failed", () => {
        setCallInProgress(false);
        setCallStatus("Call failed");
        ua.stop();
        setShowEndCallButton(false);
        setShowVideoCallButton(false);
      });
    } catch (error) {
      setCallStatus("Failed to connect to the SIP server");
    }

    return () => {
      if (ua) {
        ua.stop();
      }
    };
  }, [sipUrl, sipPassword, websocketUrl]);
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
      setShowEndCallButton(true);
      ua.on("connected", () => {
        setCallInProgress(true);
        setShowRejectButton(false);
        setShowVideoCallButton(true);
      });

      ua.on("ended", () => {
        setCallInProgress(false);
        setCallStatus("Call ended");
        setShowEndCallButton(false);
        setShowVideoCallButton(false);
        ua.stop();
      });

      ua.on("failed", () => {
        setCallInProgress(false);
        setCallStatus("Call failed");
        setShowEndCallButton(false);
        setShowVideoCallButton(false);
      });

      const options = {
        mediaConstraints: { audio: true, video: false },
      };
      ua.call(`sip:${phoneNumber}@2-test4.gcalls.vn:50061`, options);
    } catch (error) {
      setCallStatus("Failed to make the call");
    }
  };
  const handleVideoCall = () => {
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
      setIsCameraOn(true); // Bật camera
      setShowEndCallButton(true);
      ua.on("connected", () => {
        setCallInProgress(true);
        setShowRejectButton(false);
        setShowVideoCallButton(true);
      });

      ua.on("ended", () => {
        setCallInProgress(false);
        setCallStatus("Call ended");
        setIsCameraOn(false); // Tắt camera
        setShowEndCallButton(false);
        setShowVideoCallButton(false);
        ua.stop();
      });

      ua.on("failed", () => {
        setCallInProgress(false);
        setCallStatus("Call failed");
        setIsCameraOn(false); // Tắt camera
        setShowEndCallButton(false);
        setShowVideoCallButton(false);
      });

      const options = {
        mediaConstraints: { audio: true, video: true }, // Thêm video vào cuộc gọi
      };
      ua.call(`sip:${phoneNumber}@2-test4.gcalls.vn:50061`, options);
    } catch (error) {
      setCallStatus("Failed to make the call");
    }
  };

  const saveData = () => {
    const data = {
      name: name,
      sipUrl: sipUrl,
      sipPassword: sipPassword,
      websocketUrl: websocketUrl,
      viaTransport: viaTransport,
      registrarServer: registrarServer,
      contactUrl: contactUrl,
      authorizationUser: authorizationUser,
      instanceId: instanceId,
      sessionTimersEnabled: sessionTimersEnabled,
      preloadedRouteEnabled: preloadedRouteEnabled,
      callStatsEnabled: callStatsEnabled,
      appid: appid,
      appsecret: appsecret,
    };
    localStorage.setItem("settings", JSON.stringify(data));
  };

  const resetName = () => {
    setName("");
    setSipUrl("");
    setSipPassword("");
    setWebsocketUrl("");
    setViaTransport("auto");
    setRegistrarServer("");
    setContactUrl("");
    setAuthorizationUser("");
    setInstanceId("");
    setSessionTimersEnabled(false);
    setPreloadedRouteEnabled(false);
    setCallStatsEnabled(false);
    setAppid("");
    setAppsecret("");
    setPhoneNumber("");
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleResetClick = () => {
    resetName();
    resetSettings();
  };

  const handleRejectCall = () => {
    setCallStatus("Call rejected");
  };
  const handleEndCall = () => {
    if (ua) {
      ua.terminateSessions();
      setCallInProgress(false);
      setIsCameraOn(false); // Tắt camera khi kết thúc cuộc gọi
      setCallStatus("Cuộc gọi đã kết thúc");
    }
  };

  const handleNumberClick = (number) => {
    setPhoneNumber(phoneNumber + number);
  };

  const handleBackspaceClick = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  return (
    <main className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-4">
        <h1 className="text-white whitespace-nowrap text-4xl mb-10 ">
          <span className="text-2xl text-black">Ngô Thành Nhân</span> <br /> -{" "}
          <br />
          <span className="font-bold text-[#673ab7] whitespace-normal">
            Ứng tuyển vị trí Customer Success Engineer (Internship) tại GCalls
          </span>
        </h1>
        {!showSettings && (
          <>
            <div className="bg-white relative shadow-lg rounded-lg p-20 hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <IoSettingsOutline
                className="text-2xl absolute ml-[300px] mt-[-65px] hover:text-gray-400"
                onClick={handleSettingsClick}
              />
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />

              <button
                onClick={resetName}
                className="w-full px-3 py-2 bg-red-400 text-white rounded-md hover:bg-red-500"
              >
                RESET
              </button>
            </div>
          </>
        )}
        {showSettings && (
          <div
            className="settings-panel"
            style={{ maxHeight: "500px", overflow: "auto" }}
          >
            <div className="bg-white relative  shadow-lg rounded-lg p-10 hover:shadow-2xl transition-shadow duration-300 ease-in-out">
              <IoSettingsOutline
                className="text-2xl absolute ml-[340px] mt-[-25px] hover:text-gray-400"
                onClick={handleSettingsClick}
              />
              <div className="p-2 bg-slate-400 rounded-md my-5">
                <h1 className="font-bold ">JsSIP UA settings</h1>
              </div>
              <input
                type="text"
                value={sipUrl}
                onChange={(e) => setSipUrl(e.target.value)}
                placeholder="SIP URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <input
                type="password"
                value={sipPassword}
                onChange={(e) => setSipPassword(e.target.value)}
                placeholder="SIP Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <input
                type="text"
                value={websocketUrl}
                onChange={(e) => setWebsocketUrl(e.target.value)}
                placeholder="Websocket URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <select
                value={viaTransport}
                onChange={(e) => setViaTransport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              >
                <option value="auto">Auto</option>
                <option value="tcp">TCP</option>
                <option value="tls">TLS</option>
                <option value="ws">WS</option>
                <option value="wss">WSS</option>
              </select>
              <input
                type="text"
                value={registrarServer}
                onChange={(e) => setRegistrarServer(e.target.value)}
                placeholder="Registrar Server"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <input
                type="text"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder="Contact URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <input
                type="text"
                value={authorizationUser}
                onChange={(e) => setAuthorizationUser(e.target.value)}
                placeholder="Authorization User"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder="Instance ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className=" flex my-2">
                <div>
                  <span>Session Timers</span> <br />
                  <span className="text-xs">
                    Enable Session Timers as per RFC 4028
                  </span>
                </div>

                <Switch
                  checked={sessionTimersEnabled}
                  onChange={(checked) => setSessionTimersEnabled(checked)}
                  onColor="#1E88E5"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  className="pl-[75px] mt-2 h-4 w-8"
                />
              </div>
              <div className="flex my-2">
                <div>
                  <span> Preloaded Route:</span> <br />
                  <span className="text-sm">
                    Add a Route header with the server URI
                  </span>
                </div>
                <Switch
                  checked={preloadedRouteEnabled}
                  onChange={(checked) => setPreloadedRouteEnabled(checked)}
                  onColor="#1E88E5"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  className="pl-[37px] mt-2 h-4 w-8"
                />
              </div>
              <div className="p-2 my-4 bg-slate-400 rounded-md ">
                <h1 className="font-bold ">callstats.io settings</h1>
              </div>
              <div className="flex my-2">
                <div>
                  <span>Enabled</span> <br />
                  <span className="text-xs">
                    Send call statistics to callstats.io
                  </span>
                </div>

                <Switch
                  checked={callStatsEnabled}
                  onChange={(checked) => setCallStatsEnabled(checked)}
                  onColor="#1E88E5"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  className="pl-[113px] mt-2 h-4 w-8"
                />
              </div>
              <input
                value={appid}
                onChange={(e) => setAppid(e.target.value)}
                type="text"
                placeholder="AppID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />

              <input
                value={appsecret}
                onChange={(e) => setAppsecret(e.target.value)}
                type="text"
                placeholder="AppSecret"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />

              <div className="flex">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-2 m-4 py-2 bg-red-500 text-white rounded-md hover:bg-opacity-20 hover:text-slate-950 "
                >
                  CANCEL
                </button>

                <button
                  onClick={() => {
                    saveData();
                    setShowSettings(false);
                  }}
                  className="w-full px-2 m-4 py-2 bg-blue-500 text-white rounded-md hover:bg-opacity-20 hover:text-slate-950 "
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col mt-[170px] items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Quay Số</h1>
        <p className="text-lg mb-2">Trạng thái: {callStatus}</p>
        <div className="flex flex-row items-center">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => {
              if (allowPhoneNumberInput) {
                const inputNumber = e.target.value.replace(/\D/g, ""); // Loại bỏ tất cả các ký tự không phải số
                setPhoneNumber(inputNumber);
              }
            }}
            placeholder="Nhập số điện thoại"
            pattern="[0-9]*"
            className={`px-4 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              allowPhoneNumberInput ? "" : "bg-gray-300"
            }`}
          />
          {allowPhoneNumberInput && (
            <button
              onClick={handleCall}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500  focus:ring-offset-2"
            >
              Gọi
            </button>
          )}
          {allowPhoneNumberInput && (
            <button
              onClick={handleVideoCall}
              className="px-4 m-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Gọi video
            </button>
          )}
          {showVideoCallOptions && (
            <>
              <button
                onClick={handleTurnOnCamera}
                className="px-4 m-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Bật Camera
              </button>
              <button
                onClick={() => setShowVideoCallOptions(false)}
                className="px-4 m-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Hủy
              </button>
            </>
          )}

          <div className="absolute mt-[125px] ml-[220px]">
            {callInProgress && (
              <div className=" ">
                {showEndCallButton && (
                  <button
                    onClick={handleEndCall}
                    className="px-4 py-2 bg-red-500 text-white font-medium rounded mr-4 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Kết thúc cuộc gọi
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {allowPhoneNumberInput && (
          <div className="grid grid-cols-3 gap-2 mr-[200px] mt-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <button
                key={number}
                onClick={() => handleNumberClick(number)}
                className="px-4 py-2 bg-gray-500 text-white font-medium rounded hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {number}
              </button>
            ))}

            <button
              onClick={handleBackspaceClick}
              className="px-4 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Xóa
            </button>
          </div>
        )}
        {callInProgress && (
          <div className="flex mt-4">
            {showRejectButton && (
              <button
                onClick={handleRejectCall}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded mr-4 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Từ chối
              </button>
            )}
          </div>
        )}
      </div>
      {isCameraOn && (
        <div className="video-container">
          <Webcam className="video" />
        </div>
      )}
    </main>
  );
}
