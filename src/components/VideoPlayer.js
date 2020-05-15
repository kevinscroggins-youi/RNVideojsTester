import React from "react";
import { StyleSheet, Dimensions, NativeModules } from "react-native";
import { Video } from "@youi/react-native-youi";

const { width, height } = Dimensions.get("window");

export default class VideoPlayer extends React.PureComponent {
	constructor(props) {
		super(props);

		this.videoPlayer = React.createRef();

		this.state = {
			paused: false,
			muted: false,
			videoSource: {
				uri: "",
				type: ""
			},
			mediaPlaybackControlsEnabled: true,
			audioTracks: [],
			selectedAudioTrack: undefined,
			closedCaptionTracks: [],
			selectedClosedCaptionsTrack: Video.getClosedCaptionsOffId(),
			errorCode: undefined,
			nativePlayerErrorCode: undefined,
			errorMessage: undefined,
			isPreparing: false,
			isReady: false,
			isBuffering: false,
			isPlaying: false,
			isComplete: false,
			isFinalized: false,
			currentTime: 0,
			duration: 0,
			playbackState: undefined,
			mediaState: undefined,
			playerInformation: undefined
		};
	}

	componentDidMount() {
		this.setState({
			videoSource: {
				uri: "http://amssamples.streaming.mediaservices.windows.net/bc57e088-27ec-44e0-ac20-a85ccbcd50da/TearsOfSteel.ism/manifest(format=m3u8-aapl)",
				type: "HLS"
			}
		});
	}

	componentWillUnmount() {
		NativeModules.DevicePowerManagement.keepDeviceScreenOn(false);
	}

	onReady = () => {
		this.setState({
			isPreparing: false,
			isReady: true
		});

		this.videoPlayer.current.play();
	};

	onErrorOccurred = (error) => {
		this.setState({
			videoSource: {
				uri: "",
				type: "",
			},
			errorCode: error.nativeEvent.errorCode,
			nativePlayerErrorCode: error.nativeEvent.nativePlayerErrorCode,
			errorMessage: error.nativeEvent.message
		})
	};

	onBufferingStarted = () => {
		this.setState({
			isBuffering: true
		});
	};

	onBufferingEnded = () => {
		this.setState({
			isBuffering: false
		});
	};

	onPreparing = () => {
		this.setState({
			audioTracks: [],
			selectedAudioTrack: undefined,
			closedCaptionTracks: [],
			selectedClosedCaptionsTrack: -1,
			errorCode: undefined,
			nativePlayerErrorCode: undefined,
			errorMessage: undefined,
			isPreparing: true,
			isPlaying: false,
			isComplete: false,
			isFinalized: false,
			currentTime: 0,
			duration: 0,
			playbackState: undefined,
			mediaState: undefined
		});
	};

	onPlaying = () => {
		this.setState({
			isPlaying: true
		});

		NativeModules.DevicePowerManagement.keepDeviceScreenOn(true);
	};

	onPaused = () => {
		this.setState({
			isPlaying: false
		});

		NativeModules.DevicePowerManagement.keepDeviceScreenOn(false);
	};

	onCurrentTimeUpdated = (currentTime) => {
		this.setState({
			currentTime: currentTime
		});
	};

	onDurationChanged = (duration) => {
		this.setState({
			duration: duration
		});
	};

	onPlaybackComplete = () => {
		this.setState({
			isComplete: true
		});
	};

	onFinalized = () => {
		this.setState({
			isFinalized: true
		});
	};

	onStateChanged = (playerState) => {
		this.setState({
			playbackState: playerState.nativeEvent.playbackState,
			mediaState: playerState.nativeEvent.mediaState
		});
	};

	onAvailableAudioTracksChanged = (audioTracks) => {
		const tempAudioTracksArray = [];

		audioTracks.nativeEvent.forEach(element => {
			tempAudioTracksArray.push({
				id: element.id,
				name: element.name,
				language: element.language,
				valid: element.valid
			})
		});

		this.setState({
			audioTracks: tempAudioTracksArray
		})
	};

	onAvailableClosedCaptionsTracksChanged = (closedCaptionTracks) => {
		const tempClosedCaptionTracksArray = [];

		closedCaptionTracks.nativeEvent.forEach(track => {
			tempClosedCaptionTracksArray.push({
				id: track.id,
				name: track.id == Video.getClosedCaptionsOffId() && track.name.length === 0 ? "Off" : track.name,
				language: track.language
			})
		});

		this.setState({
			closedCaptionTracks: tempClosedCaptionTracksArray
		});
	};

	getPlayerInformationCallback = (playerInformation) => {
		this.setState({
			playerInformation: {
				name: playerInformation.name,
				version: playerInformation.version
			}
		});
	};

	render() {
		const {
			paused,
			videoSource,
			muted,
			mediaPlaybackControlsEnabled,
			audioTracks,
			selectedAudioTrack,
			closedCaptionTracks,
			selectedClosedCaptionsTrack
		} = this.state;

		return(
			<Video
				paused={paused}
				source={videoSource}
				muted={muted}
				mediaPlaybackControlsEnabled={mediaPlaybackControlsEnabled}
				selectedAudioTrack={Video.getAudioTrackId(audioTracks.map(track => track.id), selectedAudioTrack)}
				selectedClosedCaptionsTrack={Video.getClosedCaptionsTrackId(closedCaptionTracks.map(track => track.id), selectedClosedCaptionsTrack)}
				onBufferingStarted={this.onBufferingStarted}
				onBufferingEnded={this.onBufferingEnded}
				onErrorOccurred={this.onErrorOccurred}
				onPreparing={this.onPreparing}
				onReady={this.onReady}
				onPlaying={this.onPlaying}
				onPaused={this.onPaused}
				onPlaybackComplete={this.onPlaybackComplete}
				onFinalized={this.onFinalized}
				onCurrentTimeUpdated={this.onCurrentTimeUpdated}
				onDurationChanged={this.onDurationChanged}
				onStateChanged={this.onStateChanged}
				onAvailableAudioTracksChanged={this.onAvailableAudioTracksChanged}
				onAvailableClosedCaptionsTracksChanged={this.onAvailableClosedCaptionsTracksChanged}
				getPlayerInformationCallback={this.getPlayerInformationCallback}
				style={styles.videoPlayer}
				ref={this.videoPlayer}
			/>
		);
	}
};

const styles = StyleSheet.create({
	videoPlayer: {
		position: "absolute",
		width,
		height
	}
});
