import React, { useState, useEffect } from 'react';
import './App.css';
import ToDoList from './ToDoList/ToDoList';
import { Layout, Typography, Menu, Empty, Card, Button, Form, Input  } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

function App() {
  const [modal, setModalCreated] = useState(false);
  const [blurBackground, setBlurBackground] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [createToDoList, setCreateToDoList] = useState([]);
  const [hide, setHide] = useState(false);
  const { Header, Content } = Layout;
  const { Title } = Typography;
  const items = ['Create', !hide ? 'Hide completed' : 'Stop hiding'].map((key) => ({key, label: `${key}`,}));
  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState('horizontal');
  const onFormLayoutChange = ({ layout }) => {setFormLayout(layout);};
  const formItemLayout = formLayout === 'horizontal' ? {labelCol: {span: 4,}, wrapperCol: {span: 18,},} : null;
  const buttonItemLayout = formLayout === 'horizontal' ? {wrapperCol: {span: 14, offset: 7,},} : null;

  useEffect(() => {
    const savedLists = JSON.parse(localStorage.getItem("toDoList"));

    if(savedLists) {
      const newToDoList = savedLists.map(data => {
        return <ToDoList 
        key={data.key} 
        listKey={data.props.listKey} 
        hide={hide} title={data.props.title} 
        handleDeleteList={handleDeleteList} 
        handleNewTitle={handleNewTitle} />;
      });
      setCreateToDoList(prevList => [...prevList, ...newToDoList]);
    }
  }, []);  

  useEffect(() => {localStorage.setItem("toDoList", JSON.stringify(createToDoList));}, [createToDoList]);

  const handleMenuClick = (menuItem) => {
    if(menuItem === "Create") {handleCreateModal();}
    else if(menuItem === "Hide completed" || menuItem === "Stop hiding") {handleHide();}
  };

  const handleCreateModal = () => {
    setModalCreated(true);
    setBlurBackground(true);
  };

  const handleCloseModal = () => {
    setModalCreated(false);
    setBlurBackground(false);
  };

  const handleHide = () => {
    setCreateToDoList(prevLists => prevLists.map((toDoList) => {
        return React.cloneElement(toDoList, { hide: !hide });
    }));

    setHide(!hide);
  };

  const handleDeleteList = (keyToRemove, taskKeys) => {
    setCreateToDoList(prevItems => {
        const updatedItems = prevItems.filter(item => item.key !== keyToRemove);
        return updatedItems;
    });

    localStorage.removeItem(keyToRemove);
    localStorage.removeItem(keyToRemove + "content");
    taskKeys.forEach(task => {
        localStorage.removeItem(task + "checkBox");
    });
  }

  const handleSaveButtonClick = () => {
    if(textAreaValue.trim() !== "") {
        const newListKey = `list-${Date.now()}`;
        handleCloseModal();
        setTextAreaValue("");
        const newList = [...createToDoList, 
        <ToDoList key={newListKey}
        listKey={newListKey} 
        hide={hide} 
        title={textAreaValue.trim()}
        handleDeleteList={handleDeleteList}
        handleNewTitle={handleNewTitle} />];
        setCreateToDoList(newList);
    }
  };

  const handleNewTitle = (newTitle, key) => {
    setCreateToDoList(prevLists =>
        prevLists.map((list) => {
            if(list.props.listKey === key) {return React.cloneElement(list, { title: newTitle });}
            return list;
        })
    );
  }

  return (
    <div>
        <Layout className='layout'>
            <Layout>
                <Header className={blurBackground ? 'header blur-background' : 'header'}>
                    <Title level={2} style={{ color: "white", paddingBottom: '12px' }}>To do list</Title>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['2']}
                        items={items}
                        className='menu'
                        onClick={({ key }) => handleMenuClick(key)}
                    />
                </Header>
                <Content className='content'>
                    <div className={blurBackground ? 'blur-background' : ''}>{createToDoList}</div>
                    {!modal && createToDoList.length === 0 ? <Empty description={'No content yet!'} className='empty'/> : null}
                    {modal ? <Card title="Create to do list" bordered={false} className='card' extra={<Button shape="circle" onClick={handleCloseModal}><CloseOutlined /></Button>}>
                    <Form
                        {...formItemLayout}
                        layout={formLayout}
                        form={form}
                        initialValues={{
                        layout: formLayout,
                        }}
                        onValuesChange={onFormLayoutChange}
                        value={textAreaValue}
                        onChange={(e) => setTextAreaValue(e.target.value)}
                        style={{
                        marginLeft: '20px', maxWidth: formLayout === 'inline' ? 'none' : 600,
                        }}
                    >
                        <Form.Item label="Title">
                            <Input placeholder="list's title" />
                        </Form.Item>
                        <Form.Item {...buttonItemLayout}>
                            <Button type="primary" onClick={handleSaveButtonClick}>Submit</Button>
                        </Form.Item>
                    </Form>
                    </Card> : null}
                </Content>
            </Layout>
        </Layout>
    </div>
  );
}

export default App;