import React, { useState, useEffect } from 'react';
import './ToDoList.css';
import NewTask from './NewTask/NewTask';
import { Card, Button, Input  } from 'antd';
import { CloseOutlined, PlusOutlined, SortDescendingOutlined, SortAscendingOutlined, RedoOutlined, EditOutlined, CheckOutlined } from '@ant-design/icons';

function ToDoList({ listKey, hide, title, handleDeleteList, handleNewTitle }) { 
    const [createNewTask, setCreateNewTask] = useState([]);
    const [sortState, setSortState] = useState("original");
    const [content, setContent] = useState([]);
    const [sortedContent, setSortedContent] = useState([]);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [itemToChange, setItemToChange] = useState(null);
    const [indexToChange, setIndexToChange] = useState(null);
    const [sortedKey, setSortedKey] = useState(null);
    const [createTasksFromStorage, setCreateTasksFromStorage] = useState([]);
    const [contentFromStorage, setContentFromStorage] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(title);

    useEffect(() => {
        const savedLists = JSON.parse(localStorage.getItem(listKey));
        const savedContent = JSON.parse(localStorage.getItem(listKey + "content"));

        if(savedLists) {
            const newTask = savedLists.map(data => {
            return <NewTask 
            key={data.key} 
            taskKey={data.props.taskKey} 
            hide={hide} 
            handleTextChange={handleTextChange} 
            text={data.props.text} 
            contentLen={data.props.contentLen}
            handleContentRemove={handleContentRemove} />;
            });
            setCreateTasksFromStorage(prevList => [...prevList, ...newTask]);
        }
        if(savedContent) {
            const newContent = savedContent.map(data => {return data;});
            setContentFromStorage(prevList => [...prevList, ...newContent]);
        }
    }, []); 

    useEffect(() => {setContent(contentFromStorage);}, [contentFromStorage]);
    
    useEffect(() => {setCreateNewTask(createTasksFromStorage);}, [createTasksFromStorage]);

    useEffect(() => {
        localStorage.setItem(listKey, JSON.stringify(createNewTask));
        localStorage.setItem(listKey + "content", JSON.stringify(content));
    }, [createNewTask]);

    useEffect(() => {
        const index = createNewTask.findIndex(item => item.key === sortedKey);

        setContent(prevItems => {
            const newItems = [...prevItems];
            newItems[indexToChange] = itemToChange;
            return newItems;
        });

        if(sortState !== "original") {
            setCreateNewTask(prevTasks =>
                prevTasks.map((task, taskIndex) => {
                    if(taskIndex === index) {
                        return React.cloneElement(task, { text: itemToChange });
                    }
                    return task;
                })
            );
        }
        else {
            setCreateNewTask(prevTasks =>
                prevTasks.map((task, taskIndex) => {
                    if(taskIndex === indexToChange) {
                        return React.cloneElement(task, { text: itemToChange });
                    }
                    return task;
                })
            );
        }
    }, [itemToChange, indexToChange]);

    useEffect(() => {
        const newFilteredTasks = [];

        for(let i = 0; i < sortedContent.length; i++) {
            for(let j = 0; j < createNewTask.length; j++) {
                if((createNewTask[j].props.text === sortedContent[i]) && !newFilteredTasks.includes(createNewTask[j])) {
                    newFilteredTasks.push(createNewTask[j]);
                    break;
                }
            }
        }

        setCreateNewTask(newFilteredTasks);
    }, [sortState]);

    useEffect(() => {
        const index = createNewTask.findIndex(item => item.key === itemToRemove);
        const textContent = sortedContent[index];

        if(sortState === "original") {
            setContent(prevItems => {
            const updatedList = [...prevItems];
            updatedList.splice(index, 1);
            return updatedList;
            });
        }
        else if(sortState === "sorted") {
            let elementCount = 0;
            let elementToRemove = 0;
            for(let i = 0; i < sortedContent.length; i++) {
                if(sortedContent[i] === textContent) {
                    elementCount++;
                    if(i === index) {
                        break;
                    }
                }
            }
            for(let i = 0; i < content.length; i++) {
                if(content[i] === textContent) {
                    elementToRemove++;
                    if(elementToRemove === elementCount) {
                        setContent(prevItems => {
                        const updatedList = [...prevItems];
                        updatedList.splice(i, 1);
                        return updatedList;
                        });
                        break;
                    }
                }
            }
        }
        else if(sortState === "unsorted") {
            let elementCount = 0;
            let elementToRemove = 0;
            for(let i = 0; i < sortedContent.length; i++) {
                if(sortedContent[i] === textContent) {
                    elementCount++;
                    if(i === index) {
                        break;
                    }
                }
            }
            for(let i = content.length - 1; i >= 0; i--) {
                if(content[i] === textContent) {
                    elementToRemove++;
                    if(elementToRemove === elementCount) {
                        setContent(prevItems => {
                        const updatedList = [...prevItems];
                        updatedList.splice(i, 1);
                        return updatedList;
                        });
                        break;
                    }
                }
            }
        }

        setSortedContent(prevItems => {
            const updatedList = [...prevItems];
            updatedList.splice(index, 1);
            return updatedList;
        });

        setCreateNewTask(prevItems => {
            const updatedItems = prevItems.filter(item => item.key !== itemToRemove);
            return updatedItems;
        });
    }, [itemToRemove]);

    useEffect(() => {
        setCreateNewTask(prevLists => prevLists.map((task) => {
            return React.cloneElement(task, { hide: hide });
        }));
    }, [hide]);

    const handleSortClick = (event) => {
        event.preventDefault();
        if(sortState === "original") {
            setSortState("sorted");
            const contentCopy = [...content];
            setSortedContent(contentCopy.sort((a, b) => {return compareStrings(a, b);}));
        } 
        else if(sortState === "sorted") {
            setSortState("unsorted");
            const contentCopy = [...content];
            setSortedContent(contentCopy.sort((a, b) => {return compareStrings(b, a);}));
        } 
        else if(sortState === "unsorted") {
            setSortState("original");
            setSortedContent(content);
        }
    };

    const compareStrings = (a, b) => {
        if(a === null && b === null) {return 0;} 
        else if(a === null) {return 1;} 
        else if(b === null) {return -1;}

        const re = /(\D+)|(\d+)/g;
        const aParts = a.match(re);
        const bParts = b.match(re);
        
        while(aParts.length > 0 && bParts.length > 0) {
            const aPart = aParts.shift();
            const bPart = bParts.shift();
            if(!isNaN(aPart) && !isNaN(bPart)) {
                const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
                if(diff !== 0) {return diff;}
            } 
            else {
                const diff = aPart.localeCompare(bPart);
                if(diff !== 0) {return diff;}
            }
        }
    
        return aParts.length - bParts.length;
    };

    const handleTextChange = (item, index, key) => {
        setItemToChange(item);
        setIndexToChange(index);
        setSortedKey(key);
    }

    const handleContentRemove = (keyToRemove) => {setItemToRemove(keyToRemove);}

    const handleAddButton = () => {
        const newTaskKey = `task-${Date.now()}`;
        const newTask = [...createNewTask, 
        <NewTask 
        key={newTaskKey} 
        taskKey={newTaskKey} 
        hide={hide} 
        handleTextChange={handleTextChange} 
        text={null} 
        contentLen={createNewTask.length}
        handleContentRemove={handleContentRemove} />];
        setCreateNewTask(newTask);

        setContent(prevItems => [...prevItems, null]);
    }

    const handleDelete = () => {
        const taskKeys = [];
        createNewTask.forEach(task => {
            taskKeys.push(task.props.taskKey);
        });
        handleDeleteList(listKey, taskKeys);
    }

    const handleEditClick = () => {
        if(isEditing) {handleNewTitle(newTitle, listKey);}
        setIsEditing(!isEditing);
    }

    const handleEditTitle = (event) => {
        const newValue = event.target.value;
        setNewTitle(newValue);
    }

    return (
      <div>
        <Card title={isEditing ? (<Input placeholder="New title" value={newTitle} onChange={handleEditTitle}/>) : (title)} 
        bordered={false} className='to-do-list' extra={<div><Button type="text" onClick={handleEditClick}>{!isEditing ? <EditOutlined /> : <CheckOutlined />}</Button><Button shape="circle" onClick={handleDelete}><CloseOutlined /></Button></div>}>
            <span className='add-button-text'>Add new task</span>
            <Button shape="circle" className='add-button' onClick={handleAddButton}><PlusOutlined /></Button>
            <Button type="text" className='sort-button' onClick={handleSortClick}>{sortState === "original" ? <SortAscendingOutlined /> : sortState === "sorted" ? <SortDescendingOutlined /> : sortState === "unsorted" ? <RedoOutlined /> : null}</Button>
            <div className="task-list-container">
            {createNewTask}
          </div>
        </Card>
      </div>
    );
}

export default ToDoList;