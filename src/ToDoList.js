import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const ToDoList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [Open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    // Here you can use a mock API to fetch the data.
    // For example, you can use the JSONPlaceholder API:
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((response) => response.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = () => {
    setEditingId(null);
    setOpen(true);
  };

  const handleEdit = (id) => {
    setEditingId(id);
    const item = data.find((item) => item.id === id);
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      dueDate: item.dueDate,
      tags: item.tags,
      status: item.status,
    });
    setOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this item?",
      onOk: () => {
        setData(data.filter((item) => item.id !== id));
        message.success("Item deleted successfully!");
      },
    });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const newItem = {
          id: editingId || new Date().getTime(),
          timestampCreated: new Date(),
          title: values.title,
          description: values.description,
          dueDate: values.dueDate,
          tags: values.tags,
          status: values.status || "OPEN",
        };
        if (editingId) {
          setData(data.map((item) => (item.id === editingId ? newItem : item)));
          message.success("Item updated successfully!");
        } else {
          setData([...data, newItem]);
          message.success("Item added successfully!");
        }
        form.resetFields();
        setOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const columns = [
    {
      title: "Timestamp Created",
      dataIndex: "timestampCreated",
      sorter: (a, b) =>
        new Date(a.timestampCreated) - new Date(b.timestampCreated),
      defaultSortOrder: "descend",
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      defaultSortOrder: "ascend",
      render: (title, record) => (
        <a onClick={() => handleEdit(record.id)}>{title}</a>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      render: (description) => description,
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      sorter: (a, b) => {
        if (!a.dueDate && !b.dueDate) {
          return 0;
        } else if (!a.dueDate) {
          return 1;
        } else if (!b.dueDate) {
          return -1;
        } else {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
      },
      render: (dueDate) =>
        dueDate ? new Date(dueDate).toLocaleDateString() : "-",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      render: (tags) =>
        tags ? (
          <>
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </>
        ) : (
          "-"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        { text: "OPEN", value: "OPEN" },
        { text: "WORKING", value: "WORKING" },
        { text: "DONE", value: "DONE" },
        { text: "OVERDUE", value: "OVERDUE" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <>
          <Tag
            color={
              status === "OPEN"
                ? "blue"
                : status === "WORKING"
                ? "orange"
                : status === "DONE"
                ? "green"
                : "red"
            }
          >
            {status}
          </Tag>
        </>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
          >
            Edit
          </Button>
          <Button
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingId ? "Edit Item" : "Add Item"}
        Open={Open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        onOk={handleSave}
        okText={editingId ? "Save" : "Add"}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                max: 100,
                message: "Please input a title (maximum 100 characters)",
              },
            ]}
          >
            <Input placeholder="Enter a title" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                max: 1000,
                message: "Please input a description (maximum 1000 characters)",
              },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter a description" />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Input placeholder="Enter tags, separated by commas" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[
              {
                max: 20,
                message: "Please input a status (maximum 20 characters)",
              },
            ]}
          >
            <Input placeholder="Enter a status" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default ToDoList;
