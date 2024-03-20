import React, { useState, useEffect } from 'react';
import './NewTask.css';
import { Button, Input, Space, Checkbox  } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

function NewTask({ taskKey, hide, handleTextChange, text, contentLen, handleContentRemove }) {
    const [markDone, setMarkDone] = useState(false);
    const [content, setContent] = useState("");

    useEffect(() => {
        const savedCheckBox = JSON.parse(localStorage.getItem(taskKey + "checkBox"));

        if(savedCheckBox) {
            setMarkDone(savedCheckBox);
        }
    }, []); 

    useEffect(() => {setContent(text);}, [text]);

    const handleMarkDone = () => {
        setMarkDone(!markDone);
        localStorage.setItem(taskKey + "checkBox", JSON.stringify(!markDone));
    }

    const handleRemove = () => {handleContentRemove(taskKey);}

    const handleInputChange = (event) => {
        const newValue = event.target.value;
        setContent(newValue);
        handleTextChange(newValue === "" ? null : newValue, contentLen, taskKey);
    }

    return (
        hide && markDone ? null :
        <div className='task'>
            <Checkbox checked={markDone} className='custom-checkbox' onClick={handleMarkDone}></Checkbox>
            <Space.Compact style={{ width: '190px', height: '22px' }}>
                <Input value={content} onChange={handleInputChange} />
            </Space.Compact>
            <Button type="text" onClick={handleRemove}><CloseOutlined /></Button>
        </div>
    );
}

export default NewTask;