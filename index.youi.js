import React, { Component } from "react";
import { AppRegistry, Image, StyleSheet, Text, View } from "react-native";
import { FormFactor } from "@youi/react-native-youi";
import VideoPlayer from "./src/components/VideoPlayer";

export default class YiReactApp extends React.Component {
	render() {
		return (
			<View style={styles.mainContainer}>
				<VideoPlayer />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	mainContainer: {
		backgroundColor: "#e6e7e7",
		flex: 1
	}
});

AppRegistry.registerComponent("YiReactApp", () => YiReactApp);
