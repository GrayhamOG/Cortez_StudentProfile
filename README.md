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



