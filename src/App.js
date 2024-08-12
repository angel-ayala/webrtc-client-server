import {useRef, useState, useEffect} from 'react';
import {Button, Typography, Input} from 'antd';
import styles from './styles/App.module.css'
import * as log from 'loglevel';
import { DroneStreamManager } from './WebRTCManager'; // Adjust the import path as needed

const {Title, Paragraph} = Typography;

const URL_WEB_SOCKET = 'ws://localhost:8090';
let localStream;

log.setLevel("DEBUG");

function App() {
  const [startButtonDisabled, setStartButtonDisabled] = useState(true);
    const [joinButtonDisabled, setJoinButtonDisabled] = useState(true);
    const [callButtonDisabled, setCallButtonDisabled] = useState(true);
    const [hangupButtonDisabled, setHangupButtonDisabled] = useState(true);
    const [videoTagId, ] = useState('droneStreamOut');
    const [droneSocketID, setDroneSocketID] = useState('');
    const ws = useRef(null);

    useEffect(() => {
        const wsClient = new WebSocket(URL_WEB_SOCKET);
        ws.current = wsClient;

        wsClient.onopen = () => {
            log.debug('ws opened');
            setStartButtonDisabled(false);
        };

        wsClient.onclose = () => log.debug('ws closed');

        return () => {
            wsClient.close();
        };
    }, []);

    // const sendWsMessage = (type, body) => {
    //     log.debug('sendWsMessage invoked', type, body);
    //     ws.current.send(JSON.stringify({
    //         event: type,
    //         data: body,
    //     }));
    // };

    const start = () => {
        log.debug('start invoked');

        setStartButtonDisabled(true);
        setJoinButtonDisabled(false);

        DroneStreamManager.setupSocketEvent(ws.current, droneSocketID);
    };

    const join = () => {
        log.debug('join invoked');

        if (!droneSocketID) {
            log.error('droneSocketID is empty');
            alert('Drone Socket ID is empty');
            return;
        }

        setJoinButtonDisabled(true);
        setCallButtonDisabled(false);

        // sendWsMessage('join', { isSource: false, socketID: droneId, peerSocketId: clientId });
        localStream = DroneStreamManager.createDroneStream(droneSocketID, videoTagId)
    };

    const callOnClick = () => {
        log.debug('callOnClick invoked');

        setCallButtonDisabled(true);
        setHangupButtonDisabled(false);
        // if (typeof(myVariable) != "undefined") {
        //     if (localStream.getVideoTracks().length > 0) {
        //         log.debug(`Using video device: ${localStream.getVideoTracks()[0].label}`);
        //     }
        //     if (localStream.getAudioTracks().length > 0) {
        //         log.debug(`Using audio device: ${localStream.getAudioTracks()[0].label}`);
        //     }
        // }

        
        localStream.startDroneStream();
    };

    const hangupOnClick = () => {
        log.debug('hangupOnClick invoked');
        DroneStreamManager.closeDroneStream(droneSocketID);
        setHangupButtonDisabled(true);
        setCallButtonDisabled(false);
    };

    const renderHelper = () => {
      return (
          <div className={styles.wrapper}>
              <Input
                  placeholder="Drone Socket ID"
                  style={{width: 240, marginTop: 16}}
                  value={droneSocketID}
                  onChange={(event) => {
                      setDroneSocketID(event.target.value);
                  }}
              />
              <Button
                  onClick={start}
                  style={{width: 240, marginTop: 16}}
                  type="primary"
                  disabled={startButtonDisabled}
              >
                  Start
              </Button>
              <Button
                  onClick={join}
                  style={{width: 240, marginTop: 16}}
                  type="primary"
                  disabled={joinButtonDisabled}
              >
                  Join
              </Button>
              <Button
                  onClick={callOnClick}
                  style={{width: 240, marginTop: 16}}
                  type="primary"
                  disabled={callButtonDisabled}
              >
                  Call
              </Button>
              <Button
                  danger
                  onClick={hangupOnClick}
                  style={{width: 240, marginTop: 16}}
                  type="primary"
                  disabled={hangupButtonDisabled}
              >
                  Hangup
              </Button>
          </div>
      );
  };

  return (
      <div className={styles.App}>
          <div className={styles['App-header']}>
              <Title>WebRTC</Title>
              <Paragraph>This is a simple demo app shows how to build a WebRTC app with a signaling server from scratch.</Paragraph>
              <div className={styles['wrapper-row']} style={{justifyContent: 'space-evenly', width: '50%'}}>
                  {renderHelper()}
                  {/* {renderTextarea()} */}
              </div>
              <div
                  className={styles.playerContainer}
                  id="playerContainer"
              >
                  <video
                      id={videoTagId}
                      autoPlay
                      style={{width: 640, height: 480}}
                  />
              </div>
          </div>
      </div>
  );
}

export default App;