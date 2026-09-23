# Cortez_StudentProfile
 
A basic student profile web page built with **HTML and CSS only**, bundled and compiled into an Android app using **Apache Cordova**, and tested on the Android Emulator.
 ## Technologies Used
 
- HTML5
- CSS3
- Apache Cordova (Android platform)
## Screenshots
 
| Home / Header | About Section | Skills Section |
|---|---|---|
| ![Home screenshot](Screenshots/ss1.png) | ![About screenshot](Screenshots/ss2.png) | ![Skills screenshot](Screenshots/ss3.png) |

## ACTIVITY 3 Phone | Tablet | Desktop

# Student Profile App
 
A simple responsive Student Profile page built with HTML and CSS, packaged as a Cordova app.
 
## 1. Project Description
 
A single-page profile app for Jose Gabriel Y. Cortez, an IT student. It shows an About section and a Skills section, built with plain HTML/CSS (no JS frameworks) and fully responsive.
 
## 2. Application Structure
 
- **Header** – avatar, name, and subtitle
- **Navigation Menu** – "About" and "Skills" links
- **About Section** – background, interests, and goals
- **Skills Section** – grid of skill cards (HTML/CSS, JavaScript, Java, Laravel, Git & GitHub)
- **Footer** – copyright notice
## 3. Responsive Design
 
Made responsive using:
- `clamp()` for fluid spacing and font sizes
- CSS Grid (`auto-fit`, `minmax()`) so the skills grid reflows automatically
- Media queries at 768px and 500px for tablet/mobile layouts
## 4. UI/UX Principles Applied
 
- **Responsive Layout** – fluid container width + grid + media queries
- **Mobile-Friendly Spacing** – clamp()-based spacing shrinks on smaller screens
- **Appropriate Typography** – Fraunces for headings, Inter for body text, JetBrains Mono for labels
- **Clear Visual Hierarchy** – size/weight/color distinguish name, headings, and body text
- **Usable Controls** – nav links have 44px min tap targets and hover/focus states
- **Basic Accessibility** – skip link, alt text, focus outlines, semantic HTML tags
- **Consistent Design** – shared color palette and spacing variables throughout
## 5. Navigation
 
The About and Skills links are plain anchor tags (`#about`, `#skills`) that scroll to sections on the same page. No JavaScript is used — navigation works with native HTML/CSS only.
 
## 6. How to Run (Cordova)
 
```bash
# Install Cordova
npm install -g cordova
 
# Create the project (skip if it already exists)
cordova create StudentProfile com.example.studentprofile StudentProfile
cd StudentProfile
 
# Add this app's files into the www folder, then:
cordova platform add android
 
# Build and run
cordova build android
cordova run android
```

## PHONE 
| Home / Header | About Section | Skills Section |
|---|---|---|
| ![Home screenshot](Screenshots/phone1.png) | ![About screenshot](Screenshots/phone2.png) | ![Skills screenshot](Screenshots/phone3.png) |

## TABLET
| Home / Header | About Section | Skills Section |
|---|---|---|
| ![Home screenshot](Screenshots/tablet1.png) | ![About screenshot](Screenshots/tablet2.png) | ![Skills screenshot](Screenshots/tablet3.png) |

## DESKTOP
| Home / Header | About Section | Skills Section |
|---|---|---|
| ![Home screenshot](Screenshots/desktop1.png) | ![About screenshot](Screenshots/desktop2.png) | ![Skills screenshot](Screenshots/desktop3.png) |


## ACTIVITY 4 Multi-Page Student Profile

# Project Description
This is my activity 4 which implements different pages for my student profile such a page for home, about, skills, projects and contacts.

## Application Pages SCREENSHOTS
| Profile Section | About Section | Skills Section |
|---|---|---|
| ![Profile screenshot](Screenshots/profile.png) | ![About screenshot](Screenshots/about.png) | ![Skills screenshot](Screenshots/skills.png) |

## More Screenshots
| Projects Section | Contact Section |
|---|---|
| ![Projects screenshot](Screenshots/projects.png) | ![Contact screenshot](Screenshots/contact.png) | 


## Navigation

Navigation is implemented by using href and multiple html files, so href html syntax connects the index file with other html files.

# Responsive Design 
My code still implements the responsive design from activity 3 i just implemented it to gthe different pages.


## ACTIVITY 5 Student Profile Editing & Local Data Storage

## Project Description

Activity 5 is the implementation of JS and utilizes local data storage to store data. 

## Profile Editing
The edit function saves what ever you changed for example the name if you change it to somethin glike Andre Anderson it will then update the name in all pages. This also applies to the about me page and the skills. For the skills it just adds the skills that you saved.

## JavaScript Functionality
Javascript is used to save and edit data in the Student profile. Javascript adds functionality to buttons such as edit, save and cancel. When saving the js saves it in local storage and updates name, course, year level, about me and skills. I also added validation if the text field is blank and you click save it says "pleasae input all fields"

## Local Data Storage

Local data is used in two files, write happens in profile.js while read happens in both profile.js and shared.js. In profile.js  const STORAGE_KEY = 'studentProfile'; this is where data gets written.

## Application Screenshots

| Profile Section | Edit Profile | Edit interface |
|---|---|---|
| ![Profile screenshot](Screenshots/act5-1.png) | ![Edit screenshot](Screenshots/act5-2.png) | ![Edit Interface screenshot](Screenshots/act5-3.png) |

## Updated Info
| About me | Skills | 
|---|---|
| ![Profile screenshot](Screenshots/act5-4.png) | ![Edit screenshot](Screenshots/act5-5.png) | 




## Activity 6: Profile Picture Camera Integration

## Profile Editing
The profile page or index.html has two sections that swap places, the first one is a view mode #profile-view and a edit mode #profile-edit. Only
one is visible at a time, using the html hidden.

## Camera Integration
The app uses the cordova-plugin-camera plugin, which adds the JavaScript function navigator.camera.getPicture(success, error, options)

## Device Feature Integration
If a webpage is running inside a webpage it cannot access the camera. But with the use of cordova is can create a connection using a plugin bridge which is the 
cordova-plugin-camera plugin.

## Image Handling
Display. The plugin returns a raw Base64 string. onCameraSuccess() adds the prefix data:image/jpeg;base64, and sets the result as the src of both the profile card picture and the header avatar, so they always match. And for persistence of the profile picture uses localStorage.setItem('studentProfilePicture', dataUrl); in On every launch, profile.js (Profile page) and shared.js (all other pages) read this key and set the picture. If nothing is stored, the default josecortez.jpg is shown.

## Error Handling
The app never lets a camera problem crash the page. All camera outcomes go through two callbacks, and messages appear in a status line under the profile name (role="status", so screen readers announce it).

## Application Screenshots
| Student Profile | Change Profile Picture |  Camera  |
|---|---|---|
| ![Profile screenshot](Screenshots/student-profile.png) | ![Edit screenshot](Screenshots/change-pfp.png) | ![Edit screenshot](Screenshots/camera.png) | 

| Captured Image| Updated Profile Picture | 
|---|---|
| ![Profile screenshot](Screenshots/captured-image.png) | ![Edit screenshot](Screenshots/updated-profile-picture.png) | 