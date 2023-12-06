import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native'
import React, { useState } from 'react'
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
// import custom_search from 'custom_search';


const DetectObject = () => {

    const [imageUri, setImageUri] = useState(null);
    const [labels, setLabels] = useState(null);
    const [objects, setObjects] = useState(null);
    const [text, setText] = useState(null);
    const [properties, setProperties] = useState(null);

    const pickImage = async () => {
        try{
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4,3],
                quality: 1,
            })

            if (!result.canceled){
                setImageUri(result.assets[0].uri);
            }
            console.log(result);
        } catch(error){
            console.error("Error picking image: ", error);
        }
    };

    const analyzeImage = async () => {
        try {
            if (!imageUri) {
                alert("Please select an image first!");
                return;
            }
    
            const apiKey = 'AIzaSyB-Zv3jd8iq354d5cTWOb3GnMfu8YXg9Yw'; // Replace with your actual API key
            const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    
            const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
                encoding: FileSystem.EncodingType.Base64,
            });
    
            const requestData = {
                requests: [
                    {
                        image: {
                            content: base64ImageData,
                        },
                        features: [
                            { type: 'LABEL_DETECTION', maxResults: 2 },
                            { type: 'LOGO_DETECTION', maxResults: 2 },
                            { type: 'TEXT_DETECTION' },
                            { type: 'IMAGE_PROPERTIES' },
                        ],
                    },
                ],
            };
    
            const apiResponse = await axios.post(apiURL, requestData);
    
            console.log('API Response:', JSON.stringify(apiResponse.data));
    
            // Check if the response structure is as expected
            if (apiResponse.data && apiResponse.data.responses && apiResponse.data.responses.length > 0) {
                const responseData = apiResponse.data.responses[0];
                setLabels(responseData.labelAnnotations);
                setObjects(responseData.logoAnnotations);
                setText(responseData.fullTextAnnotation?.text);
                setProperties(responseData.imagePropertiesAnnotation?.dominantColors?.colors);
            } else {
                console.error("Invalid API response:", apiResponse.data);
                alert("Error analyzing image. Try again.");
            }
    
        } catch (error) {
            console.error("Error analyzing image: ", error);
            alert("Error analyzing image. Try again.");
        }
    };

    const searchProduct = async () => {
    try {
        if (!labels || labels.length === 0) {
            console.log('No labels to search for.');
            return;
        }

        // Отримання тексту, властивостей та об'єктів для пошуку.
        const searchText = text || '';
        const searchProperties = properties ? properties.join(' ') : '';
        const searchObjects = objects ? objects.join(' ') : '';

        const apiKey = 'AIzaSyBfauI8jNinDwmL1097-dXj82IeN-HTpRc'; // Замініть на свій API ключ.
        const cx = 'e4546d8eff8a849d0'; // Замініть на свій CX.

        // Створення загального запиту для пошуку.
        const query = [searchText, searchProperties, searchObjects, ...labels.map(label => label.description)].join(' ');

        const apiUrl = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${cx}`;

        const response = await axios.get(apiUrl);

        if (response.data.items && response.data.items.length > 0) {
            console.log('Found search results:', response.data.items);
            // Тут ви можете взаємодіяти із знайденими продуктами з Google Search.
        } else {
            console.log('No search results found.');
        }
    } catch (error) {
        console.error('Error searching for products:', error);
    }
};

    

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text>DetectObject</Text>
                {imageUri && (
                    <Image
                        source={{ uri: imageUri }}
                        style={{ width: 300, height: 300, borderRadius: 10 }}
                    />
                )}
                <View style={styles.buttons_container}>
                    <TouchableOpacity onPress={pickImage} style={styles.button}>
                        <Text style={styles.text}>
                            Choose
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={analyzeImage} style={styles.button}>
                        <Text style={styles.text}>
                            Analyze
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={searchProduct} style={styles.button}>
                        <Text style={styles.text}>
                            Search
                        </Text>
                    </TouchableOpacity>
                </View>
                {labels && labels.length > 0 && (
                    <View>
                        <Text style={styles.outputext}>
                            Labels:
                        </Text>
                        {labels.map((label) => (
                            <Text
                                key={label.mid}
                                style={styles.outputext}
                            >
                                {label.description}
                            </Text>
                        ))}
                    </View>
                )}
                {objects && objects.length > 0 && (
                    <View>
                        <Text style={styles.outputext}>
                            Logos:
                        </Text>
                        {objects.map((logo) => (
                            <Text
                                key={logo.mid}
                                style={styles.outputext}
                            >
                                {logo.description}
                            </Text>
                        ))}
                    </View>
                )}
                {text && (
                    <View>
                        <Text style={styles.outputext}>
                            Text:
                        </Text>
                        <Text style={styles.outputext}>
                            {text}
                        </Text>
                    </View>
                )}
                {properties && properties.length > 0 && (
                    <View>
                        <Text style={styles.outputext}>
                            Image Properties:
                        </Text>
                        {properties.map((color, index) => (
                            <Text
                                key={index}
                                style={{ ...styles.outputext, color: `rgb(${color.red}, ${color.green}, ${color.blue})` }}
                            >
                                {`RGB: (${color.red}, ${color.green}, ${color.blue})`}
                            </Text>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

export default DetectObject;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: '#0d0d0d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#d37aa7',
        borderRadius: 15,
        padding:10,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10,
        marginTop:20,
    },
    text: {

    },
    outputext:{
        color: '#fff',
    },
    buttons_container:{
        flexDirection: 'row',
    },
});