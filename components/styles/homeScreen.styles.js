import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#5A9AA9',
    },
    headerContainer: {
        backgroundColor: '#fff',
    },
    headerIcon: {
        color: '#5A9AA9',
        paddingHorizontal: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        backgroundColor: '#4682b4',
        elevation: 5,
        borderRadius: 50,
        padding: 15,
    },
    scrollToTodayButton: {
        position: 'absolute',
        right: 30,
        bottom: 100,
        backgroundColor: '#4682b4',
        elevation: 5,
        borderRadius: 50,
        padding: 15,
    },

    todoItem: {
        padding: 10,
        marginVertical: 5,
        borderRadius: 10,
        width: '90%',
        marginRight: 10,
        marginLeft: 5,
    },
    selectedTodoItem: {
        backgroundColor: '#FF6464',
    },
    selectedAction: {
        paddingHorizontal: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "white",
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal:"6%",
    },
    loading: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
    },
    todoGroup: {
        marginBottom: 20,
        width: '90%',
        alignSelf: 'center',
    },
    grp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    groupTitle: {
        fontWeight: 'bold',
        width: '14%',
        padding: 3,
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#ddd',
        marginBottom: 25,
        marginTop: 3,
        marginLeft: 3,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    dateText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statusPending: {
        textAlign: 'right',
        color: 'orange',
    },
    statusAhead: {
        textAlign: 'right',
        color: 'green',
    },
    statusComplete: {
        textAlign: 'right',
        color: 'gray',
    },
    title: {
        fontSize: 23,
        fontWeight: '300',
        color: '#5A9AA9',
        margin: 2,
        textAlign: 'center',
        padding: 5,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
    },
    todoTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        width: '80%',
    },
    todoTitleComplete: {
        textDecorationLine: 'line-through',
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
        width: '80%',
    },
    todoDescription: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    todoCreated: {
        fontSize: 12,
        color: '#999',
        marginVertical: 5,
        textAlign: 'right',
    },
    todoStatus: {
        marginTop: 10,
        fontSize: 13,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    completeBtn: {
        fontSize: 12,
        color: 'green',
        marginVertical: 5,
        textAlign: 'right',
    },
    actionGrp: {
        flexDirection: 'row',
    },

    modalContent: {
        flex: 1,
        padding: 20,
        backgroundColor: '#5A9AA9',
    },

    modalInput: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#dcdcdc',
        backgroundColor: 'white',
        borderRadius: 5,
        marginBottom: 10,
    },
    modalPicker: {
        height: 40,
        justifyContent: 'center',
        width: '45%',
        borderWidth: 1,
        borderColor: '#dcdcdc',
        borderRadius: 5,
        backgroundColor: 'white',
    },
    modalTextarea: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#B4B4B4FF',
        marginRight: 10,
        elevation: 5,
    },
    createButton: {
        backgroundColor: '#4682b4',
        elevation: 5,
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalPickerGrp: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    notificationTitle: {
        color: 'white',
        fontWeight: '100',
    },
    viewBtn: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#5A9AA9',
        padding: 5,
        width: '45%',
        alignItems: 'center'
    },
    rescheduleBtn: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#5A9AA9',
        padding: 5,
        width: '45%',
        alignItems: 'center'
    },
});
