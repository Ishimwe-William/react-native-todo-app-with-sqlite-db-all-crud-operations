import {Modal, ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {styles} from "../../styles/homeScreen.styles";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Feather from "react-native-vector-icons/Feather";
import {Picker} from "@react-native-picker/picker";
import React from "react";
import {hourOptions, minuteOptions} from "../constants/constants";

export const EditTodoModal = (
    {
        openModal,
        actionType,
        todoData,
        handleInputChange,
        showDatePicker,
        isDatePickerVisible,
        handleConfirmDate,
        hideDatePicker,
        reminderHours,
        reminderMinutes,
        setReminderHours,
        setReminderMinutes,
        handleUpdate,
        handleCreate,
        handleCloseModal
    }) => {
    return (
        <Modal visible={openModal} animationType="slide">
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
                <View style={styles.modalContent}>
                    <Text style={[styles.title, {backgroundColor: 'white'}]}>
                        {actionType === 'update' ? 'Update' : 'Create'}{' '}ToDo
                    </Text>
                    <TextInput
                        style={[styles.modalInput, {marginTop: 20}]}
                        placeholder="Title"
                        value={todoData.value}
                        onChangeText={(text) => handleInputChange('value', text)}
                    />
                    <TextInput
                        style={[styles.modalInput, styles.modalTextarea]}
                        placeholder="Description"
                        multiline={true}
                        numberOfLines={4}
                        value={todoData.description}
                        onChangeText={(text) =>
                            handleInputChange('description', text)
                        }
                    />
                    <TouchableOpacity onPress={showDatePicker}>
                        <Text style={styles.modalInput}>
                            Due: {moment(todoData.toBeComplete).format('lll')}
                        </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="datetime"
                        minimumDate={new Date()}
                        onConfirm={handleConfirmDate}
                        onCancel={hideDatePicker}
                    />
                    <Text style={styles.notificationTitle}>
                        {<Feather name="bell" size={20}/>} Add notification time [{' '}
                        {reminderHours} hrs {reminderMinutes} min before due ]
                    </Text>
                    <View style={styles.modalPickerGrp}>
                        <View style={styles.modalPicker}>
                            <Picker
                                selectedValue={reminderHours}
                                onValueChange={(value) => setReminderHours(value)}>
                                {hourOptions.map((hour) => (
                                    <Picker.Item
                                        label={`${hour} hr`}
                                        value={hour}
                                        key={hour}
                                    />
                                ))}
                            </Picker>
                        </View>
                        <View style={styles.modalPicker}>
                            <Picker
                                selectedValue={reminderMinutes}
                                onValueChange={(value) => setReminderMinutes(value)}>
                                {minuteOptions.map((minute) => (
                                    <Picker.Item
                                        label={`${minute} min`}
                                        value={minute}
                                        key={minute}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={handleCloseModal}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.createButton]}
                            onPress={actionType === 'update' ? handleUpdate : handleCreate}>
                            <Text
                                style={styles.modalButtonText}>{actionType === 'update' ? 'Update' : 'Create'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    )
}