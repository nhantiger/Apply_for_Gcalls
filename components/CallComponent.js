import { useEffect } from 'react';
import JsSIP from 'jssip';

export default function CallComponent() {
  useEffect(() => {
    let socket = new JsSIP.WebSocketInterface('wss://sip.myhost.com');
    let configuration = {
      sockets  : [ socket ],
      uri      : 'sip:alice@example.com',
      password : 'alicepassword'
    };

    let ua = new JsSIP.UA(configuration);

    ua.on('connected', function(e){ 
      console.log('connected');
    });

    ua.on('disconnected', function(e){ 
      console.log('disconnected');
    });

    ua.on('registered', function(e){ 
      console.log('registered');
    });

    ua.on('unregistered', function(e){ 
      console.log('unregistered');
    });

    ua.on('registrationFailed', function(e){ 
      console.log('registrationFailed');
    });

    ua.on('newRTCSession', function(e){ 
      console.log('newRTCSession');
    });

    ua.start();
  }, []);

  return (
    <div>
      <h1>Call Component</h1>
    </div>
  );
}
