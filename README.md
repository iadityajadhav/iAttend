# 🏫 iAttend – Smart Attendance Management System



iAttend is a full-stack attendance management system designed for colleges.  

It allows teachers to mark attendance of all students at once by sharing an attendance code or on a single click to mark manually, students to view their attendance, and admins to handle college info.



---



## 🚀 Features



### 🧑🏻‍🎓 Student Module

- Login and profile view

- View subject-wise attendance

- View:

 - Present / Absent status

 - Total lectures

 - Attendance percentage



### 🧑🏻‍🏫 Teacher Module

- Create attendance sessions

- Mark attendance

- View attendance records

- Update attendance

- Lecture-wise and date-wise attendance view



### 🧑🏻‍💼 Admin Module

- Creates college Id

- Create classes and assign subjects



---



## ⚙️ Tech Stack



### 💻 Frontend

- React.js

- Tailwind CSS

- Axios



### 🖥️ Backend

- Node.js

- Express.js

- MongoDB

- JWT Authentication



---



## 🔐 Authentication



- JWT based authentication

- Token stored in localStorage

- Token sent via Authorization header

- Protected routes for Student, Teacher and Admin



---



## 📝 Attendance Logic


Attendance stored per:

 - Student

 - Subject

 - Date

 - Lecture number

- Duplicate attendance is prevented

Student can view:

 - Total lectures

 - Present count

 - Absent count

 - Attendance percentage

Teacher can view:

 - Total lectures

 - Present count

 - Absent count

 - Attendance percentage

 And can:

 - mark student as present or absent on a single click

 - manually add students attendance



