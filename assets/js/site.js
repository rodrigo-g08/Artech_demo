const { storage, language, escapeHTML, normaliseCars, parseHash, todayInLima, dateError, whatsappURL, visit } = Artech;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let CARS = [], currentSlug = null, carsStatus = 'loading';
const dict = {
  "en": {
    "d3_loading": "Loading…",
    "nav_collection": "Collection",
    "nav_taller": "The Workshop",
    "nav_history": "History",
    "nav_main": "Main navigation",
    "footer_intro": "Rescue. Rebuild. Exhibit.\nDiscover the collection in Chorrillos.",
    "footer_museum": "Museum",
    "footer_visit": "Visit",
    "footer_location": "Chorrillos · Lima, Peru",
    "footer_hours": "Tuesday–Sunday · 09:00–19:00",
    "footer_copyright": "© 2026 ARTECH · Lima, Peru",
    "footer_legal": "Legal information",
    "lang_switch": "Cambiar a español",
    "nav_experience": "Experiences",
    "nav_360": "3D demo",
    "nav_about": "About",
    "nav_cafe": "Restaurant",
    "nav_contact": "Contact",
    "nav_book": "Book",
    "cafe_tag": "RESTAURANT · CAFÉ · BAR",
    "cafe_title": "Restaurant · Café · Bar",
    "cafe_hint": "Tap a category to explore the menu",
    "cafe_sub": "An exceptional gastronomic experience",
    "cafe_lead": "Signature cuisine by Chef Carla Navea, created to complement the museum experience.",
    "cafe_explore": "Explore Our Menu",
    "cafe_hours": "Tuesday to Sunday · 9:00 a.m. – 7:00 p.m.",
    "cafe_closing": "Discover a space where a passion for automobiles and fine dining come together in a unique experience.",
    "foto_amb": "AMBIENCE PHOTO",
    "nav_blog": "Blog",
    "blog_kick": "THE JOURNAL",
    "blog_title": "Stories from the Museum",
    "blog_sub": "Classic cars, restoration and the culture behind the collection in Lima.",
    "blog_back": "← All articles",
    "post_cta": "Book your visit",
    "vh_back": "← Collection",
    "tk_title": "An Invitation to History",
    "tk_sub": "Choose your preferred date and group size. Our team will confirm availability and the applicable price via WhatsApp.",
    "tk_hours_t": "Opening Hours",
    "tk_hours": "Tuesday to Sunday · 9 am – 7 pm",
    "tk_addr_t": "Address",
    "tk_continue": "Request via WhatsApp",
    "tk_note": "This sends a visit request, not a confirmed booking. Availability and price are confirmed by the museum. Online payment is not available yet.",
    "disc_t": "Discover ARTECH",
    "disc_s": "A look at the spaces, details, and pieces that make every visit an extraordinary experience.",
    "v3d_overview": "Overview",
    "v3d_profile": "Exterior",
    "v3d_wheels": "Wheels",
    "v3d_lights": "Lights",
    "v3d_interior": "Interior",
    "v3d_rear": "Rear",
    "nav_tickets": "Book your visit",
    "hero_tickets": "Book your visit",
    "tk_date": "Select a date",
    "tk_general": "General",
    "tk_general_d": "Adult admission",
    "tk_reduced": "Children & Seniors",
    "tk_reduced_d": "Kids and senior citizens",
    "tk_pick": "Please pick a date and at least one ticket.",
    "hero_title": "Shift into history",
    "hero_sub": "A living experience of cars, art and gastronomy in Lima — discover the collection and plan your visit.",
    "hero_btn": "3D demo",
    "xp_kick": "ARTECH EXPERIENCES",
    "xp_title": "An immersive experience that awakens your senses",
    "xp_sub": "At ARTECH, every visit is a guided experience designed to connect visitors with the world of automobiles, their history, design, and passion.",
    "xp_note": "All visits are guided, with groups of up to 20 people per hour.",
    "xp_dur": "Duration",
    "xp_price": "Price",
    "xp_groups": "Groups",
    "xp_cap_t": "Capacity",
    "xp_cap_1": "20 people per hour for regular experiences.",
    "xp_cap_2": "For private experiences, the tour is tailored to each group to ensure personalized, high-level service.",
    "banner": "A living museum\nof motoring history",
    "pl_tag": "SHIFT INTO HISTORY",
    "pl_sub": "AUTOMOBILE MUSEUM · LIMA",
    "p1_t": "Book your private tour",
    "p1_d": "Reserve a guided visit and step into an unrepeatable collection.",
    "p2_t": "Restaurant · Café · Bar",
    "p2_d": "Signature cuisine inside the Museum, by Chef Carla Navea.",
    "visit_info": "Visit info",
    "exp_the": "ARTECH",
    "exp_title": "EXPERIENCES",
    "exp_lead": "Guided tours, exclusive Porsche access and signature cuisine — a complete journey through automotive history.",
    "exp_cta": "See the experiences",
    "leg_t": "The legacy",
    "leg_1": "For decades, Jimmy has rescued, restored, and preserved automotive history in the heart of Lima.",
    "leg_2": "From the World's Oldest Car to rare Porsche classics, each vehicle has an engine, a story, and a soul.",
    "leg_3": "This is not a garage. This is a living Museum. And your experience starts here.",
    "serv_t": "Our Services",
    "s1_t": "Group Tours",
    "s1_d": "Guided experiences for groups through the full collection.",
    "s2_t": "Private Tours",
    "s2_d": "One-on-one curated visits at your own pace.",
    "s3_t": "Private Sales",
    "s3_d": "Exclusive one-on-one transactions for high-value or rare vehicles.",
    "s4_t": "Restaurant · Café · Bar",
    "s4_d": "Signature cuisine by Chef Carla Navea.",
    "d3_kick": "EXPLORE EVERY DETAIL",
    "d3_title": "EXPERIENCE 3D",
    "d3_hint": "↤ Drag to rotate 360° · scroll to zoom ↦",
    "pill1": "360° View",
    "pill2": "Real-time Interaction",
    "pill3": "Immersive Experience",
    "col_t": "Our Collection",
    "col_s1": "Classic cars, engineering and design",
    "col_s2": "Explore the history behind the collection",
    "col_t2": "A Collection That Makes History",
    "col_lead": "ARTECH brings together 96 exceptional vehicles, the result of decades of Jimmy's passion and dedication to preserving automotive history. Each piece stands out for its design, engineering, and historical significance, making the collection a unique legacy of elegance, innovation, and automotive culture in Lima, Peru.",
    "back_home": "← Back to Home",
    "pgx_sub": "Tours, dining and themed halls — a complete journey through automotive history.",
    "pgx_cta": "Book your experience",
    "ft_preowned": "Vehicles for sale",
    "ft_visit": "Book your visit",
    "ft_privacy": "Privacy",
    "ft_language": "Language",
    "ft_cookies": "Cookies",
    "ft_careers": "Careers",
    "ft_club": "ARTECH Club",
    "ft_press": "Press room",
    "ft_sitemap": "Site map",
    "ft_blog": "Blog",
    "ft_legal": "Legal",
    "ft_faqs": "FAQs",
    "ft_sustain": "Sustainability",
    "ft_claims": "Complaints book",
    "ft_contact": "Contact",
    "ft_tickets": "Book your visit",
    "tw_sys_lead": "Every workshop is scored from one to three stars on each of these five criteria.",
    "tw_main_t": "The main workshop",
    "tw_main_badge": "Main workshop",
    "tw_allied_t": "Allied workshops",
    "tw_rest": "Restoration",
    "tw_photo": "Photo",
    "tw_video": "Video",
    "tw_soon": "Coming soon",
    "tw_logo": "Logo",
    "nav_workshops": "Workshops",
    "tw_kick": "THE ARTECH STARS",
    "tw_title": "Affiliated Workshops",
    "tw_lead": "The houses of craft that keep this collection alive. ARTECH stars are awarded on the work actually done, across five criteria: chrome, mechanics, bodywork and paint, turnaround and value.",
    "tw_system": "The rating",
    "tw_houses": "The five houses",
    "tw_works": "Works",
    "tw_note": "Every workshop is visited and reviewed once a year. The stars are awarded by ARTECH and may change from one edition to the next.",
    "pgc_kick": "THE FULL",
    "pgc_sub": "From the World's Oldest Car to rare Porsche classics — explore every model in our permanent exhibition.",
    "pgc_note": "More models are added as the archive is digitized — 96 vehicles in the permanent collection.",
    "pgc_cta": "Book your visit",
    "flt_all": "All",
    "flt_classic": "Classics",
    "flt_modern": "Modern",
    "flt_brands": "All brands",
    "flt_search": "Search...",
    "flt_none": "No vehicles match your search.",
    "view_all": "View all",
    "vh_cover": "COVER PHOTO",
    "vh_year": "YEAR",
    "vh_plate": "PLATE",
    "vh_detail": "DETAIL",
    "vh_info": "VEHICLE INFORMATION",
    "vh_view1": "VIEW 01",
    "vh_view2": "VIEW 02",
    "vh_general": "GENERAL SPECIFICATIONS:",
    "vh_story": "In 1950, only 21 K-2 units were built, of which three were exported to South America: two to Uruguay and one to Peru. This car was imported to Peru by Sociedad Mercantil Internacional in December 1950.",
    "vs_maker": "Manufacturer",
    "vs_model": "Model",
    "vs_year": "Year",
    "vs_plate": "Plate",
    "vs_body": "Body",
    "vs_type": "Type",
    "vs_cyl": "Engine",
    "vs_disp": "Displacement",
    "vs_power": "Power",
    "vs_trans": "Transmission",
    "vs_comp": "Compression",
    "vs_ign": "Ignition",
    "vs_head": "Cylinder head",
    "vs_carb": "Carburation",
    "vs_brakes": "Brakes",
    "vs_wheel": "Wheel",
    "vs_speed": "Top speed",
    "st1": "Vehicles on exhibition",
    "st2": "Years of history",
    "st3": "Brands represented",
    "year": "Year",
    "view_col": "View all 96 models",
    "ph_media": "Photo / Video",
    "ph_title": "Car name",
    "ph_desc": "Add year & description",
    "col_count": "models",
    "ap_title": "The Experience",
    "ap_sub": "The tour, the café and our themed halls",
    "ap_cdesc": "Add photos, video & description",
    "ap_tour": "Guided Tour",
    "ap_cafe": "Café",
    "ap_hall1": "Main Hall",
    "ap_hall2": "Porsche Hall",
    "ap_hall3": "Classics Hall",
    "ap_hall4": "Events Hall",
    "intro_t": "Visit the museum",
    "addr_loc": "Chorrillos, Lima",
    "addr_info": "English-speaking staff | Credit cards accepted",
    "contact_t": "Contact us",
    "c_kicker": "GET IN TOUCH",
    "c_sub": "Ask about a visit or a private experience. Send your request to our team via WhatsApp.",
    "f_name": "Full name",
    "f_phone": "Phone / WhatsApp",
    "f_email": "Email address",
    "f_subject": "I'm interested in",
    "f_msg": "Message",
    "f_submit": "Continue in WhatsApp",
    "f_note": "This opens WhatsApp with your request. Review and send it there. Your message is not submitted by this website.",
    "ph_name": "Your name",
    "ph_phone": "+1, +44, +51… (country code)",
    "ph_email": "you@email.com",
    "ph_msg": "Tell us about your visit...",
    "opt1": "Group tour",
    "opt2": "Private tour",
    "opt3": "Private sale",
    "opt4": "Restaurant reservation",
    "opt5": "Other",
    "c_direct": "Prefer to talk now?",
    "c_direct_sub": "Reach us directly and get an instant reply during opening hours.",
    "c_email": "Email",
    "c_visit": "Visit us",
    "c_hours": "Tuesday to Sunday · 9 am – 7 pm",
    "la_addr": "Address",
    "la_hours": "Hours",
    "la_hours_v": "Tuesday to Sunday · 9 am – 7 pm",
    "la_wa": "WhatsApp",
    "la_mail": "Email",
    "loc_kicker": "LOCATION",
    "loc_title": "Find us in Chorrillos, Lima",
    "loc_desc": "The Museum opens its doors in Chorrillos, in a permanent covered exhibition hall. English-speaking staff, credit cards accepted, and parking available for visitors.",
    "loc_l1": "ADDRESS",
    "loc_l2": "HOURS",
    "loc_hours": "Tuesday to Sunday · 9 am – 7 pm",
    "nl_kicker": "ARTECH UPDATES",
    "nl_title": "Stay in touch with ARTECH",
    "nl_ph": "Enter your email address",
    "nl_privacy": "I accept the privacy policy.",
    "skip_content": "Skip to content",
    "skip_intro": "Skip intro",
    "sound_on": "Sound on",
    "sound_off": "Sound off",
    "tk_time": "Preferred time",
    "tk_any_time": "No preference",
    "tk_help": "All times are in Lima (UTC−5). Requests are subject to confirmation.",
    "tk_group": "For groups larger than 20, contact us.",
    "tk_required": "Select a date and at least one ticket.",
    "tk_past": "Choose today or a future date, using Lima time.",
    "tk_closed": "The museum is closed on Mondays. Choose another day.",
    "tk_limit": "Regular visit requests are limited to 20 guests. Contact us for a larger group.",
    "tk_qty": "tickets requested",
    "tk_remove": "Remove",
    "tk_add": "Add",
    "tk_pending": "Visit request prepared. Send it in WhatsApp; the museum must confirm it.",
    "contact_ready": "Your request is ready in WhatsApp. Send it there to contact the museum. Your form has been kept here.",
    "nl_unavailable": "Newsletter registration is not available yet. Follow the museum for updates.",
    "nl_follow": "Follow on Instagram",
    "retry": "Retry",
    "catalogue_loading": "Loading the collection…",
    "catalogue_error": "The collection could not be loaded. Check your connection and try again.",
    "catalogue_empty": "There are no published vehicles yet.",
    "route_missing": "This page could not be found.",
    "vehicle_missing": "This vehicle is not in the current catalogue.",
    "photo_open": "Open photo",
    "close": "Close",
    "search_label": "Search by vehicle, brand, year or plate",
    "brand_label": "Filter by brand",
    "previous": "Previous",
    "next": "Next",
    "menu": "Menu",
    "photo_gallery": "Photo gallery",
    "layout_one": "One column",
    "layout_two": "Two columns",
    "layout_four": "Four columns",
    "start_3d": "Explore 3D demo",
    "demo_3d": "Illustrative 3D model; not a virtual tour of the museum.",
    "demo_3d_short": "ILLUSTRATIVE MODEL",
    "model_3d": "3D DESIGN STUDY",
    "viewer_fallback": "The 3D viewer is unavailable. You can explore the collection instead.",
    "cafe_photo_note": "Museum interior",
    "h_hero_pre": "ARTECH · LIMA",
    "h_hero_title": "THE AUTOMOBILE,\nTHROUGH TIME.",
    "h_hero_hook": "Classic and contemporary cars. A collection to discover in Lima.",
    "h_hook_fallback": "The journey begins in 1903. Meet its first piece below.",
    "h_enter_workshop": "Enter the workshop ↗",
    "h_scroll": "Discover the collection ↓",
    "h_brands_label": "Collection brands",
    "h_brands": "{count} brands. Under one roof.",
    "h_video_pause": "Pause video",
    "h_video_play": "Play video",
    "h_video_no_audio": "No audio track",
    "h_video_failed": "Video unavailable",
    "h_sound_on": "Sound on",
    "h_sound_off": "Mute",
    "h_statement": "A CLASSIC SPEAKS\nBEFORE YOU START\nTHE ENGINE.",
    "h_statement_note": "LOOK CLOSELY. THE DETAILS TELL THE STORY.",
    "h_journey": "THE JOURNEY",
    "h_years": "115 YEARS.\nSIX STOPS.",
    "h_collection": "View the collection ↗",
    "h_journey_note": "From the 1903 Tonneau to the 2018 Porsche. Choose a year to discover its piece.",
    "h_piece": "Discover this piece ↗",
    "h_memory": "SOME CARS\nARE FORGOTTEN.",
    "h_return": "HERE, THEY\nDRIVE AGAIN.",
    "h_return_body": "The collection is only one part of the story. Enter the workshop and discover the craft behind each piece.",
    "h_workshop": "Discover the workshop ↗",
    "h_rescue": "RESCUE",
    "h_rescue_body": "See the details that make a piece worth preserving.",
    "h_rebuild": "REBUILD",
    "h_rebuild_body": "Discover the work behind the seats, the engine and the body.",
    "h_exhibit": "EXHIBIT",
    "h_exhibit_body": "Meet the piece in person. Look beyond the photograph.",
    "h_access": "THREE LEVELS OF ACCESS",
    "h_levels": "LOOKING IS EASY.\nUNDERSTANDING TAKES MORE.",
    "h_anchor": "For S/ 40 more, step inside the workshop.",
    "h_level_1": "COLLECTION",
    "h_level_1_detail": "Guided tour · 1 hour",
    "h_level_2": "COLLECTION + WORKSHOP",
    "h_level_2_detail": "VIP · 1 hour 30 minutes",
    "h_level_3": "ALL OF ARTECH. PRIVATE.",
    "h_level_3_detail": "Minimum 15 people · 2 hours 30 minutes",
    "h_person": "per person",
    "h_choose": "Plan this visit ↗",
    "h_private": "Explore private access ↗",
    "h_request_note": "Send your request. The team confirms availability and the final price on WhatsApp.",
    "h_ready": "READY TO",
    "h_close": "IGNITE\nTHE HISTORY?",
    "h_no_payment": "No online payment. We confirm your request on WhatsApp.",
    "h_auburn_detail": "Auburn 852 headlamp and grille",
    "h_auburn_interior": "Auburn 852 dashboard and interior",
    "h_upholstery": "Leather upholstery and instruments",
    "h_ferrari_detail": "Ferrari badge and grille"
  },
  "es": {
    "d3_loading": "Cargando…",
    "nav_collection": "Colección",
    "nav_taller": "El Taller",
    "nav_history": "Historia",
    "nav_main": "Navegación principal",
    "footer_intro": "Rescatar. Reconstruir. Exhibir.\nDescubre la colección en Chorrillos.",
    "footer_museum": "Museo",
    "footer_visit": "Visita",
    "footer_location": "Chorrillos · Lima, Perú",
    "footer_hours": "Martes–domingo · 09:00–19:00",
    "footer_copyright": "© 2026 ARTECH · Lima, Perú",
    "footer_legal": "Información legal",
    "lang_switch": "Switch to English",
    "nav_experience": "Experiencias",
    "nav_360": "Demo 3D",
    "nav_about": "Nosotros",
    "nav_cafe": "Restaurante",
    "nav_contact": "Contacto",
    "nav_book": "Reserva",
    "cafe_tag": "RESTAURANTE · CAFÉ · BAR",
    "cafe_title": "Restaurante · Café · Bar",
    "cafe_hint": "Toca una categoría para ver la carta",
    "cafe_sub": "Una experiencia gastronómica excepcional",
    "cafe_lead": "Cocina de autor de la Chef Carla Navea, creada para complementar la experiencia del museo.",
    "cafe_explore": "Explora Nuestra Carta",
    "cafe_hours": "Martes a Domingo · 9:00 a.m. – 7:00 p.m.",
    "cafe_closing": "Descubre un espacio donde la pasión por los automóviles y la alta cocina se encuentran en una experiencia única.",
    "foto_amb": "FOTO AMBIENTE",
    "nav_blog": "Blog",
    "blog_kick": "EL DIARIO",
    "blog_title": "Historias del Museo",
    "blog_sub": "Autos clásicos, restauración y la cultura detrás de la colección en Lima.",
    "blog_back": "← Todos los artículos",
    "post_cta": "Reserva tu turno",
    "vh_back": "← Colección",
    "tk_title": "Una invitación a la historia",
    "tk_sub": "Elige la fecha que prefieres y el tamaño de tu grupo. Nuestro equipo confirmará la disponibilidad y el precio aplicable por WhatsApp.",
    "tk_hours_t": "Horario",
    "tk_hours": "Martes a Domingo · 9 am – 7 pm",
    "tk_addr_t": "Dirección",
    "tk_continue": "Consultar por WhatsApp",
    "tk_note": "Esto envía una solicitud de visita, no una reserva confirmada. El museo confirma la disponibilidad y el precio. El pago en línea aún no está disponible.",
    "disc_t": "Descubre ARTECH",
    "disc_s": "Un vistazo a los espacios, detalles y piezas que hacen de cada visita una experiencia extraordinaria.",
    "v3d_overview": "Vista general",
    "v3d_profile": "Exterior",
    "v3d_wheels": "Ruedas",
    "v3d_lights": "Luces",
    "v3d_interior": "Interior",
    "v3d_rear": "Trasera",
    "nav_tickets": "Reserva tu turno",
    "hero_tickets": "Reserva tu turno",
    "tk_date": "Selecciona una fecha",
    "tk_general": "General",
    "tk_general_d": "Entrada adulto",
    "tk_reduced": "Niños y adultos mayores",
    "tk_reduced_d": "Niños y personas de la tercera edad",
    "tk_pick": "Elige una fecha y al menos una entrada.",
    "hero_title": "Un viaje a la historia",
    "hero_sub": "Una experiencia viva de autos, arte y gastronomía en Lima: descubre la colección y planifica tu visita.",
    "hero_btn": "Demo 3D",
    "xp_kick": "EXPERIENCIAS ARTECH",
    "xp_title": "Una experiencia inmersiva que despierta tus sentidos",
    "xp_sub": "En ARTECH, cada visita es una experiencia guiada diseñada para conectar al visitante con el mundo del automóvil, su historia, diseño y pasión.",
    "xp_note": "Todas nuestras visitas son guiadas, con grupos de hasta 20 personas por hora.",
    "xp_dur": "Duración",
    "xp_price": "Precio",
    "xp_groups": "Grupos",
    "xp_cap_t": "Capacidad",
    "xp_cap_1": "20 personas por hora en las experiencias regulares.",
    "xp_cap_2": "En las experiencias privadas, el recorrido se adapta al grupo para garantizar una atención personalizada y de alto nivel.",
    "banner": "Historia viva\ndel automóvil",
    "pl_tag": "UN VIAJE A LA HISTORIA",
    "pl_sub": "MUSEO DEL AUTOMÓVIL · LIMA",
    "p1_t": "Reserva tu tour privado",
    "p1_d": "Reserva una visita guiada y entra a una colección irrepetible.",
    "p2_t": "Restaurante · Café · Bar",
    "p2_d": "Cocina de autor dentro del Museo, por la Chef Carla Navea.",
    "visit_info": "Ver info",
    "exp_the": "ARTECH",
    "exp_title": "EXPERIENCIAS",
    "exp_lead": "Tours guiados, acceso exclusivo a Porsche y cocina de autor — un viaje completo por la historia del automóvil.",
    "exp_cta": "Ver las experiencias",
    "leg_t": "El legado",
    "leg_1": "Durante décadas, Jimmy ha rescatado, restaurado y preservado la historia automotriz en el corazón de Lima.",
    "leg_2": "Desde el auto más antiguo del mundo hasta clásicos Porsche excepcionales, cada vehículo tiene un motor, una historia y un alma.",
    "leg_3": "Esto no es un garaje. Es un Museo vivo. Y tu experiencia empieza aquí.",
    "serv_t": "Nuestros Servicios",
    "s1_t": "Tours Grupales",
    "s1_d": "Experiencias guiadas para grupos por toda la colección.",
    "s2_t": "Tours Privados",
    "s2_d": "Visitas personalizadas, uno a uno, a tu propio ritmo.",
    "s3_t": "Ventas Privadas",
    "s3_d": "Transacciones exclusivas, uno a uno, para vehículos excepcionales o de alto valor.",
    "s4_t": "Restaurante · Café · Bar",
    "s4_d": "Cocina de autor de la Chef Carla Navea.",
    "d3_kick": "EXPLORA CADA DETALLE",
    "d3_title": "EXPERIENCIA 3D",
    "d3_hint": "↤ Arrastra para rotar 360° · usa la rueda para acercar ↦",
    "pill1": "Vista 360°",
    "pill2": "Interacción en tiempo real",
    "pill3": "Experiencia inmersiva",
    "col_t": "Nuestra Colección",
    "col_s1": "Autos clásicos, ingeniería y diseño",
    "col_s2": "Descubre la historia detrás de la colección",
    "col_t2": "Una Colección Que Hace Historia",
    "col_lead": "ARTECH reúne 96 vehículos excepcionales, fruto de décadas de pasión y dedicación de Jimmy por preservar la historia del automóvil. Cada pieza destaca por su diseño, su ingeniería y su importancia histórica, y convierte a la colección en un legado único de elegancia, innovación y cultura automotriz en Lima, Perú.",
    "back_home": "← Volver al inicio",
    "pgx_sub": "Tours, gastronomía y salas temáticas — un viaje completo por la historia automotriz.",
    "pgx_cta": "Reserva tu experiencia",
    "ft_preowned": "Vehículos en venta",
    "ft_visit": "Reserva tu turno",
    "ft_privacy": "Privacidad",
    "ft_language": "Idioma",
    "ft_cookies": "Cookies",
    "ft_careers": "Trabaja con nosotros",
    "ft_club": "ARTECH Club",
    "ft_press": "Sala de prensa",
    "ft_sitemap": "Mapa del sitio",
    "ft_blog": "Blog",
    "ft_legal": "Legal",
    "ft_faqs": "Preguntas frecuentes",
    "ft_sustain": "Sostenibilidad",
    "ft_claims": "Libro de reclamaciones",
    "ft_contact": "Contacto",
    "ft_tickets": "Reserva tu turno",
    "tw_sys_lead": "Cada taller se califica de una a tres estrellas en cada uno de estos cinco criterios.",
    "tw_main_t": "El taller principal",
    "tw_main_badge": "Taller principal",
    "tw_allied_t": "Talleres aliados",
    "tw_rest": "Restauración",
    "tw_photo": "Foto",
    "tw_video": "Video",
    "tw_soon": "Próximamente",
    "tw_logo": "Logo",
    "nav_workshops": "Talleres",
    "tw_kick": "LAS ESTRELLAS ARTECH",
    "tw_title": "Talleres Afiliados",
    "tw_lead": "Las casas de oficio que mantienen viva esta colección. Las estrellas ARTECH se otorgan según el trabajo realizado, en cinco criterios: cromado, mecánica, planchado y pintura, tiempo y precio.",
    "tw_system": "La calificación",
    "tw_houses": "Las cinco casas",
    "tw_works": "Obras",
    "tw_note": "Cada taller se visita y se revisa una vez al año. Las estrellas las otorga ARTECH y pueden cambiar de una edición a la siguiente.",
    "pgc_kick": "TODA LA",
    "pgc_sub": "Desde el auto más antiguo del mundo hasta clásicos Porsche excepcionales — explora cada modelo de nuestra exhibición permanente.",
    "pgc_note": "Se agregan más modelos a medida que se digitaliza el archivo — 96 vehículos en la colección permanente.",
    "pgc_cta": "Reserva tu visita",
    "flt_all": "Todos",
    "flt_classic": "Clásicos",
    "flt_modern": "Modernos",
    "flt_brands": "Todas las marcas",
    "flt_search": "Buscar...",
    "flt_none": "Ningún vehículo coincide con tu búsqueda.",
    "view_all": "Ver todos",
    "vh_cover": "PORTADA",
    "vh_year": "AÑO",
    "vh_plate": "PLACA",
    "vh_detail": "DETALLE",
    "vh_info": "INFORMACIÓN DEL VEHÍCULO",
    "vh_view1": "VISTA 01",
    "vh_view2": "VISTA 02",
    "vh_general": "CARACTERÍSTICAS GENERALES:",
    "vh_story": "En 1950, se construyeron tan solo 21 K-2, de los cuales tres se exportaron a Sudamérica: dos a Uruguay y uno al Perú. Este auto fue importado al Perú por la Sociedad Mercantil Internacional en diciembre de 1950.",
    "vs_maker": "Fabricante",
    "vs_model": "Modelo",
    "vs_year": "Año",
    "vs_plate": "Placa",
    "vs_body": "Carrocería",
    "vs_type": "Tipo",
    "vs_cyl": "Motor",
    "vs_disp": "Cilindrada",
    "vs_power": "Potencia",
    "vs_trans": "Transmisión",
    "vs_comp": "Compresión",
    "vs_ign": "Encendido",
    "vs_head": "Culata",
    "vs_carb": "Carburación",
    "vs_brakes": "Frenos",
    "vs_wheel": "Aro",
    "vs_speed": "Velocidad",
    "st1": "Vehículos en exhibición",
    "st2": "Años de historia",
    "st3": "Marcas representadas",
    "year": "Año",
    "view_col": "Ver los 96 modelos",
    "ph_media": "Foto / Video",
    "ph_title": "Nombre del auto",
    "ph_desc": "Agregar año y descripción",
    "col_count": "modelos",
    "ap_title": "La Experiencia",
    "ap_sub": "El recorrido, la cafetería y nuestras salas temáticas",
    "ap_cdesc": "Agregar fotos, video y descripción",
    "ap_tour": "Recorrido Guiado",
    "ap_cafe": "Cafetería",
    "ap_hall1": "Sala Principal",
    "ap_hall2": "Sala Porsche",
    "ap_hall3": "Sala de Clásicos",
    "ap_hall4": "Sala de Eventos",
    "intro_t": "Visita el museo",
    "addr_loc": "Chorrillos, Lima",
    "addr_info": "Personal bilingüe | Aceptamos tarjetas",
    "contact_t": "Contáctanos",
    "c_kicker": "ESCRÍBENOS",
    "c_sub": "Consulta sobre una visita o experiencia privada. Envía tu solicitud al equipo por WhatsApp.",
    "f_name": "Nombre completo",
    "f_phone": "Teléfono / WhatsApp",
    "f_email": "Correo electrónico",
    "f_subject": "Me interesa",
    "f_msg": "Mensaje",
    "f_submit": "Continuar en WhatsApp",
    "f_note": "Se abrirá WhatsApp con tu consulta. Revísala y envíala allí. Esta web no envía el mensaje.",
    "ph_name": "Tu nombre",
    "ph_phone": "+1, +44, +51… (código de país)",
    "ph_email": "tucorreo@email.com",
    "ph_msg": "Cuéntanos sobre tu visita...",
    "opt1": "Tour grupal",
    "opt2": "Tour privado",
    "opt3": "Venta privada",
    "opt4": "Reserva en el restaurante",
    "opt5": "Otro",
    "c_direct": "¿Prefieres hablar ahora?",
    "c_direct_sub": "Contáctanos directamente y recibe respuesta inmediata en horario de atención.",
    "c_email": "Correo",
    "c_visit": "Visítanos",
    "c_hours": "Martes a Domingo · 9 am – 7 pm",
    "la_addr": "Dirección",
    "la_hours": "Horario",
    "la_hours_v": "Martes a domingo · 9 am – 7 pm",
    "la_wa": "WhatsApp",
    "la_mail": "Correo",
    "loc_kicker": "UBICACIÓN",
    "loc_title": "Encuéntranos en Chorrillos, Lima",
    "loc_desc": "El museo abre sus puertas en Chorrillos, en un recinto techado de exhibición permanente. Personal bilingüe, aceptamos tarjetas y hay estacionamiento para visitantes.",
    "loc_l1": "DIRECCIÓN",
    "loc_l2": "HORARIO",
    "loc_hours": "Martes a Domingo · 9 am – 7 pm",
    "nl_kicker": "NOVEDADES ARTECH",
    "nl_title": "Sigue las novedades de ARTECH",
    "nl_ph": "Ingresa tu correo electrónico",
    "nl_privacy": "Acepto la política de privacidad.",
    "skip_content": "Ir al contenido",
    "skip_intro": "Omitir intro",
    "sound_on": "Activar sonido",
    "sound_off": "Silenciar",
    "tk_time": "Horario preferido",
    "tk_any_time": "Sin preferencia",
    "tk_help": "Todos los horarios corresponden a Lima (UTC−5). La solicitud está sujeta a confirmación.",
    "tk_group": "Para grupos de más de 20 personas, contáctanos.",
    "tk_required": "Elige una fecha y al menos una entrada.",
    "tk_past": "Elige hoy o una fecha futura, considerando la hora de Lima.",
    "tk_closed": "El museo cierra los lunes. Elige otro día.",
    "tk_limit": "Las solicitudes de visita regular admiten hasta 20 personas. Contáctanos para un grupo mayor.",
    "tk_qty": "entradas solicitadas",
    "tk_remove": "Quitar",
    "tk_add": "Añadir",
    "tk_pending": "Solicitud preparada. Envíala en WhatsApp; el museo debe confirmarla.",
    "contact_ready": "Tu consulta está lista en WhatsApp. Envíala allí para contactar al museo. Conservamos el formulario en esta pantalla.",
    "nl_unavailable": "La suscripción al boletín aún no está disponible. Sigue al museo para conocer las novedades.",
    "nl_follow": "Seguir en Instagram",
    "retry": "Reintentar",
    "catalogue_loading": "Cargando la colección…",
    "catalogue_error": "No pudimos cargar la colección. Revisa tu conexión e inténtalo otra vez.",
    "catalogue_empty": "Todavía no hay vehículos publicados.",
    "route_missing": "No encontramos esta página.",
    "vehicle_missing": "Este vehículo no figura en el catálogo actual.",
    "photo_open": "Abrir fotografía",
    "close": "Cerrar",
    "search_label": "Buscar por vehículo, marca, año o placa",
    "brand_label": "Filtrar por marca",
    "previous": "Anterior",
    "next": "Siguiente",
    "menu": "Menú",
    "photo_gallery": "Galería de fotografías",
    "layout_one": "Una columna",
    "layout_two": "Dos columnas",
    "layout_four": "Cuatro columnas",
    "start_3d": "Explorar demo 3D",
    "demo_3d": "Modelo 3D ilustrativo; no es un recorrido virtual del museo.",
    "demo_3d_short": "MODELO ILUSTRATIVO",
    "model_3d": "ESTUDIO DE DISEÑO 3D",
    "viewer_fallback": "El visor 3D no está disponible. Puedes explorar la colección.",
    "cafe_photo_note": "Interior del museo",
    "h_hero_pre": "ARTECH · LIMA",
    "h_hero_title": "EL AUTOMÓVIL,\nA TRAVÉS DEL TIEMPO.",
    "h_hero_hook": "Clásicos y contemporáneos. Una colección para descubrir en Lima.",
    "h_hook_fallback": "El recorrido comienza en 1903. Te presentamos su primera pieza al bajar.",
    "h_enter_workshop": "Entrar al taller ↗",
    "h_scroll": "Descubre la colección ↓",
    "h_brands_label": "Marcas de la colección",
    "h_brands": "{count} marcas. Un solo techo.",
    "h_video_pause": "Pausar video",
    "h_video_play": "Reproducir video",
    "h_video_no_audio": "Sin audio",
    "h_video_failed": "Video no disponible",
    "h_sound_on": "Activar sonido",
    "h_sound_off": "Silenciar",
    "h_statement": "UN CLÁSICO HABLA\nANTES DE ENCENDER\nEL MOTOR.",
    "h_statement_note": "MIRA DE CERCA. LOS DETALLES CUENTAN LA HISTORIA.",
    "h_journey": "EL RECORRIDO",
    "h_years": "115 AÑOS.\nSEIS PARADAS.",
    "h_collection": "Ver la colección ↗",
    "h_journey_note": "Del Tonneau de 1903 al Porsche de 2018. Elige un año y descubre su pieza.",
    "h_piece": "Descubrir esta pieza ↗",
    "h_memory": "ALGUNOS AUTOS\nSE OLVIDAN.",
    "h_return": "AQUÍ VUELVEN\nA RODAR.",
    "h_return_body": "La colección es una parte de la historia. Entra al taller y descubre el trabajo detrás de cada pieza.",
    "h_workshop": "Conocer El Taller ↗",
    "h_rescue": "RESCATAR",
    "h_rescue_body": "Mira los detalles que hacen que una pieza merezca conservarse.",
    "h_rebuild": "RECONSTRUIR",
    "h_rebuild_body": "Descubre el trabajo detrás de los asientos, el motor y la carrocería.",
    "h_exhibit": "EXHIBIR",
    "h_exhibit_body": "Conoce la pieza en persona. Mira más allá de la fotografía.",
    "h_access": "TRES NIVELES DE ACCESO",
    "h_levels": "MIRAR ES FÁCIL.\nENTENDER, NO.",
    "h_anchor": "Por S/ 40 más, entras al taller.",
    "h_level_1": "COLECCIÓN",
    "h_level_1_detail": "Recorrido guiado · 1 hora",
    "h_level_2": "COLECCIÓN + TALLER",
    "h_level_2_detail": "VIP · 1 hora 30 minutos",
    "h_level_3": "TODO ARTECH, EN PRIVADO",
    "h_level_3_detail": "Mínimo 15 personas · 2 horas 30 minutos",
    "h_person": "por persona",
    "h_choose": "Planifica esta visita ↗",
    "h_private": "Explora el acceso privado ↗",
    "h_request_note": "Envía tu solicitud. El equipo confirma disponibilidad y precio final por WhatsApp.",
    "h_ready": "¿LISTO PARA",
    "h_close": "ENCENDER\nLA HISTORIA?",
    "h_no_payment": "No pagas en línea. Confirmamos tu solicitud por WhatsApp.",
    "h_auburn_detail": "Faro y parrilla del Auburn 852",
    "h_auburn_interior": "Tablero e interior del Auburn 852",
    "h_upholstery": "Tapicería de cuero e instrumentos",
    "h_ferrari_detail": "Emblema y parrilla de Ferrari"
  }
};
let lang = language();
function apply(l){
  lang = l === 'es' ? 'es' : 'en';
  l = lang;
  storage('localStorage', 'artech_lang', l);
  document.documentElement.lang = l;
  document.querySelectorAll('[data-i]').forEach(el=>{
    const k = el.getAttribute('data-i');
    if(dict[l][k]!==undefined) el.textContent = dict[l][k];
  });
  document.querySelectorAll('[data-ph]').forEach(el=>{
    const k = el.getAttribute('data-ph');
    if(dict[l][k]!==undefined) el.placeholder = dict[l][k];
  });
  document.querySelectorAll('.lang button').forEach(b=>b.classList.toggle('active', b.dataset.lang===l));
  document.querySelectorAll('[data-alt]').forEach(el => el.alt = dict[l][el.dataset.alt] || '');
  document.querySelectorAll('[data-aria]').forEach(el => el.setAttribute('aria-label', dict[l][el.dataset.aria] || ''));
  document.querySelectorAll('.pc-lay').forEach(button => {
    button.setAttribute('aria-label',dict[l][button.dataset.cols==='1'?'layout_one':button.dataset.cols==='4'?'layout_four':'layout_two']);
    button.setAttribute('aria-pressed',String(button.classList.contains('active')));
  });
  document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  const labels = { burger: 'menu', carSearch: 'search_label', brandSel: 'brand_label', lightbox: 'photo_gallery' };
  Object.entries(labels).forEach(([id, key]) => document.getElementById(id)?.setAttribute('aria-label', dict[l][key]));
  document.getElementById('ftLang')?.setAttribute('aria-label', dict[l].lang_switch);
  renderHome();
  window.dispatchEvent(new Event('artech:lang'));
  const pv=document.getElementById('page-vehicle');
  if(currentSlug && pv && pv.classList.contains('active')) showVehicle(currentSlug);
  if(typeof renderCafeMenu==='function') renderCafeMenu();
  if(typeof renderBlog==='function') renderBlog();
  if(typeof renderTalleres==='function') renderTalleres();
  if(typeof renderExperiencias==='function') renderExperiencias();
  const _k=parseHash(location.hash).key;
  if(typeof INFO!=='undefined' && INFO[_k]) renderInfo(_k);
  if(typeof currentPost!=='undefined' && currentPost){ const pp=document.getElementById('page-post'); if(pp && pp.classList.contains('active')) showPost(currentPost); }
  if(typeof window._pcApply === 'function') window._pcApply();
  if(typeof window.updateTickets === 'function') window.updateTickets();
  if(typeof window.updateCatalogueStatus === 'function') window.updateCatalogueStatus();
  updatePageMetadata();
}
document.querySelectorAll('.lang button').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.lang)));

// header scroll
const header=document.getElementById('header');
addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>60));

// scroll-spy: highlight the nav link of the section in view
const spyLinks=[...document.querySelectorAll('#navlinks a[href^="#"]')].filter(a=>a.getAttribute('href').length>1);
const spyMap=spyLinks.map(a=>({a,el:document.getElementById(a.getAttribute('href').slice(1))})).filter(o=>o.el);
if('IntersectionObserver' in window && spyMap.length){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting && !document.body.classList.contains('page-open')){
        spyMap.forEach(o=>o.a.classList.toggle('current', o.el===en.target));
      }
    });
  },{rootMargin:'-45% 0px -50% 0px',threshold:0});
  spyMap.forEach(o=>io.observe(o.el));
}

/* ===== EXPERIENCIAS ARTECH =====
   Contenido facilitado por el cliente. Editar aqui, en EN y ES.
   n = numero · t = titulo · dur = duracion · pre = precio
   d = descripcion · extra = beneficio adicional · inc = lo que incluye  */
const EXPERIENCIAS = [
 {n:'01',
  t:{en:'Artech Experience', es:'Experiencia Artech'},
  dur:{en:'1 hour', es:'1 hora'},
  pre:{en:'S/ 80 per person', es:'S/ 80 por persona'},
  d:{en:'An immersive experience through our automobile exhibition, accompanied by a guided tour that reveals the stories, details, and most remarkable pieces in the collection.',
     es:'Una experiencia inmersiva por nuestra exposición de automóviles, acompañada por un recorrido guiado que descubre las historias, detalles y piezas más especiales de la colección.'},
  extra:{k:{en:'Additional benefit', es:'Beneficio adicional'},
         v:{en:'With a minimum restaurant spend of S/ 100 per person, guests receive access to the Artech Experience.',
            es:'Con un consumo mínimo de S/ 100 por persona en el restaurante, el visitante obtiene acceso a la Experiencia Artech.'}}},

 {n:'02',
  t:{en:'VIP Experience', es:'Experiencia VIP'},
  dur:{en:'1 hour 30 minutes', es:'1 hora 30 minutos'},
  pre:{en:'S/ 120 per person', es:'S/ 120 por persona'},
  d:{en:'A more exclusive experience that, in addition to the exhibition tour, includes a guided visit to the workshop, offering an up-close look at the work, restoration, and care behind the automobiles.',
     es:'Una experiencia más exclusiva que, además del recorrido por la exposición, incluye la visita guiada al taller, permitiendo conocer de cerca el trabajo, restauración y cuidado de los automóviles.'},
  x:{en:'A unique opportunity for those who want to go beyond the exhibition and discover what happens behind the scenes.',
     es:'Una propuesta diseñada para quienes quieren ir más allá de la exposición y descubrir lo que ocurre detrás de escena.'}},

 {n:'03',
  t:{en:'Private Experience', es:'Experiencia Privada'},
  dur:{en:'2 hours 30 minutes', es:'2 horas 30 minutos'},
  pre:{en:'S/ 450 per person', es:'S/ 450 por persona'},
  gr:{en:'Minimum 15 people', es:'Mínimo 15 personas'},
  d:{en:'A fully private and personalized experience, featuring an intensive guided tour of the museum and its exclusive spaces.',
     es:'Una experiencia completamente privada y personalizada, con un recorrido intensivo y guiado por el museo y sus espacios especiales.'},
  incT:{en:'Includes', es:'Incluye'},
  inc:[{en:'Private guided tour of the museum', es:'Visita privada y guiada al museo'},
       {en:'Exclusive access to the workshop',  es:'Acceso exclusivo al taller'},
       {en:'In-depth tour of the collection',   es:'Recorrido intensivo por la colección'},
       {en:'Gastronomic experience',            es:'Experiencia gastronómica'},
       {en:'Welcome Pisco Sour',                es:'Pisco Sour de bienvenida'},
       {en:'One appetizer from our menu',       es:'Una entrada de nuestra carta'},
       {en:'Personalized attention throughout the experience', es:'Atención personalizada durante todo el recorrido'}],
  x:{en:'An experience designed for private groups, corporate events, celebrations, and guests seeking a unique and exclusive automotive experience.',
     es:'Una experiencia pensada para grupos privados, empresas, celebraciones y clientes que buscan una experiencia automotriz única y exclusiva.'}}
];

function renderExperiencias(){ window.ArtechEditorial?.renderExperiences(); }

/* ===== TALLERES AFILIADOS · ESTRELLAS ARTECH =====
   Las estrellas se otorgan por CINCO criterios. Editar aqui, en EN y ES.
   p = puntuacion por criterio, de 1 a 3 estrellas.
   PUNTUACIONES DE RELLENO: sustituir por las reales de ARTECH.
   obras[].foto / .video = huecos reservados; se rellenan con el archivo
   cuando este disponible (ej. foto:'assets/talleres/indicars/auburn.jpg'). */
const CRITERIOS = [
 {k:'cromado',  t:{en:'Chrome',            es:'Cromado'}},
 {k:'mecanica', t:{en:'Mechanics',         es:'Mecánica'}},
 {k:'pintura',  t:{en:'Bodywork & paint',  es:'Planchado y pintura'}},
 {k:'tiempo',   t:{en:'Turnaround',        es:'Tiempo'}},
 {k:'precio',   t:{en:'Value',             es:'Precio'}}
];

const PRINCIPAL = {
 n:'INDICARS',
 z:'Lima, Perú',
 logo:'',                                   /* hueco para el logo */
 e:{en:'Full restoration · parts made in-house',
    es:'Restauración integral · piezas fabricadas en casa'},
 d:{en:'INDICARS manufactures and repairs every part a car needs, one piece at a time. Classic vehicles are returned to their original condition; some are modernized when the project calls for it. It is the workshop behind the restorations of this collection.',
    es:'INDICARS fabrica y arregla cada pieza que necesita un auto, una por una. Los vehículos clásicos se devuelven a su estado original y algunos se modernizan cuando el proyecto lo pide. Es el taller detrás de las restauraciones de esta colección.'},
 p:{cromado:3, mecanica:3, pintura:3, tiempo:3, precio:2},
 obras:[
  {n:'Auburn 852 Supercharged', foto:'', video:''},
  {n:'Volvo P1800',             foto:'', video:''},
  {n:'Porsche 930 Turbo',       foto:'', video:''},
  {n:'Dodge Challenger R/T',    foto:'', video:''}
 ]
};

const TALLERES = [
 {n:'RP Alta Gama', z:'Lima, Perú',
  e:{en:'High-end bodywork and paint', es:'Planchado y pintura de alta gama'},
  d:{en:'Placeholder text. Describe here the work of RP Alta Gama within the collection.',
     es:'Texto de relleno. Describir aquí el trabajo de RP Alta Gama dentro de la colección.'},
  p:{cromado:3, mecanica:2, pintura:3, tiempo:2, precio:2},
  obras:[{n:'', foto:''},{n:'', foto:''},{n:'', foto:''},{n:'', foto:''}]},

 {n:'Carmelo Service', z:'Lima, Perú',
  e:{en:'Mechanics and maintenance', es:'Mecánica y mantenimiento'},
  d:{en:'Placeholder text. Describe here the work of Carmelo Service within the collection.',
     es:'Texto de relleno. Describir aquí el trabajo de Carmelo Service dentro de la colección.'},
  p:{cromado:2, mecanica:3, pintura:2, tiempo:3, precio:3},
  obras:[{n:'', foto:''},{n:'', foto:''},{n:'', foto:''},{n:'', foto:''}]},

 {n:'Germania Automotriz', z:'Lima, Perú',
  e:{en:'Mechanics and European specialists', es:'Mecánica y especialistas en europeos'},
  d:{en:'Placeholder text. Describe here the work of Germania Automotriz within the collection.',
     es:'Texto de relleno. Describir aquí el trabajo de Germania Automotriz dentro de la colección.'},
  p:{cromado:2, mecanica:3, pintura:2, tiempo:2, precio:3},
  obras:[{n:'', foto:''},{n:'', foto:''},{n:'', foto:''},{n:'', foto:''}]}
];

const ESTRELLAS = [
 {s:1, t:{en:'One ARTECH star',   es:'Una estrella ARTECH'},
       d:{en:'Exceptional craft. Worth entrusting a piece to.',
          es:'Oficio excepcional. Merece confiarle una pieza.'}},
 {s:2, t:{en:'Two ARTECH stars',  es:'Dos estrellas ARTECH'},
       d:{en:'Remarkable mastery. Worth a detour.',
          es:'Maestría notable. Merece desviarse del camino.'}},
 {s:3, t:{en:'Three ARTECH stars',es:'Tres estrellas ARTECH'},
       d:{en:'Absolute excellence. Worth a journey in itself.',
          es:'Excelencia absoluta. Merece un viaje en sí mismo.'}}
];

function renderTalleres(){
  const host=document.getElementById('tallerGrid'); if(!host) return;
  const L=o=>o ? (o[lang]||o.en||'') : '';
  const et=k=>(typeof dict!=='undefined' && dict[lang] && dict[lang][k]) ? dict[lang][k] : k;
  const ESTR='<svg class="tw-star" viewBox="0 0 24 24" aria-hidden="true">'
    +'<path d="M12 2.6l2.5 6.1 6.6.5-5 4.3 1.5 6.4-5.6-3.5-5.6 3.5 1.5-6.4-5-4.3 6.6-.5z"/></svg>';
  /* fila de estrellas: llenas hasta la puntuacion, huecas el resto */
  const fila=v=>'<span class="tw-rate" role="img" aria-label="'+v+'/3">'
    + ESTR.repeat(v)
    + '<span class="tw-off">'+ESTR.repeat(3-v)+'</span></span>';
  /* tabla de los cinco criterios */
  const tabla=p=>'<dl class="tw-scores">'
    + CRITERIOS.map(c=>'<div><dt>'+L(c.t)+'</dt><dd>'+fila(p[c.k]||0)+'</dd></div>').join('')
    + '</dl>';

  /* --- los cinco criterios, explicados --- */
  const crit=document.getElementById('twCriterios');
  if(crit) crit.innerHTML=CRITERIOS.map(c=>'<span class="tw-chip">'+L(c.t)+'</span>').join('');

  /* --- que significa cada nivel --- */
  const leyenda=document.getElementById('tallerLeyenda');
  if(leyenda) leyenda.innerHTML=ESTRELLAS.slice().reverse().map(e=>
    '<div class="tw-tier"><div class="tw-tier-stars">'+ESTR.repeat(e.s)+'</div>'
    +'<h4>'+L(e.t)+'</h4><p>'+L(e.d)+'</p></div>').join('');

  /* --- bloque de restauracion: huecos de foto y video --- */
  const restauracion=(obras,conVideo)=>'<div class="tw-rest">'
    + '<h4 class="tw-rest-t">'+et('tw_rest')+'</h4>'
    + '<div class="tw-rest-grid">'
    + obras.map(o=>{
        const media = o.foto
          ? '<img src="'+o.foto+'" alt="'+(o.n||'')+'" loading="lazy">'
          : '<span class="tw-ph">'+et('tw_photo')+'</span>';
        const vid = conVideo ? (o.video
          ? '<video class="tw-vid" src="'+o.video+'" controls playsinline></video>'
          : '<span class="tw-ph tw-ph-v">'+et('tw_video')+'</span>') : '';
        return '<figure class="tw-rest-item">'
             + '<div class="tw-rest-media">'+media+'</div>'
             + (vid?'<div class="tw-rest-media tw-rest-video">'+vid+'</div>':'')
             + '<figcaption>'+(o.n||'<span class="tw-soon">'+et('tw_soon')+'</span>')+'</figcaption>'
             + '</figure>';
      }).join('')
    + '</div></div>';

  /* --- taller principal --- */
  const pr=document.getElementById('twPrincipal');
  if(pr) pr.innerHTML='<article class="tw-main-card">'
    + '<div class="tw-main-top">'
    +   '<div class="tw-logo">'+(PRINCIPAL.logo
          ? '<img src="'+PRINCIPAL.logo+'" alt="'+PRINCIPAL.n+'">'
          : '<span class="tw-ph">'+et('tw_logo')+'</span>')+'</div>'
    +   '<div class="tw-main-txt">'
    +     '<div class="tw-badge">'+et('tw_main_badge')+'</div>'
    +     '<h3>'+PRINCIPAL.n+'</h3>'
    +     '<div class="tw-spec">'+L(PRINCIPAL.e)+'</div>'
    +     '<div class="tw-zone">'+PRINCIPAL.z+'</div>'
    +     '<p class="tw-desc">'+L(PRINCIPAL.d)+'</p>'
    +   '</div>'
    + '</div>'
    + tabla(PRINCIPAL.p)
    + restauracion(PRINCIPAL.obras, true)
    + '</article>';

  /* --- talleres aliados --- */
  host.innerHTML=TALLERES.map(t=>'<article class="tw-card">'
    + '<div class="tw-body">'
    +   '<h3>'+t.n+'</h3>'
    +   '<div class="tw-spec">'+L(t.e)+'</div>'
    +   '<div class="tw-zone">'+t.z+'</div>'
    +   '<p class="tw-desc">'+L(t.d)+'</p>'
    +   tabla(t.p)
    +   restauracion(t.obras, false)
    + '</div></article>').join('');
}

/* ===== PÁGINAS DE INFORMACIÓN (pie de página) =====
   Todo el contenido vive en este objeto: el cliente solo edita aquí, en EN y ES.
   t = título · lead = entrada · blocks = secciones · acc = acordeón · links = mapa del sitio
   TEXTO DE RELLENO: sustituir por la información real de ARTECH.            */
const INFO = {
 'p-preowned':{
  t:{en:'Vehicles for sale',es:'Vehículos en venta'},
  lead:{en:'A discreet service for collectors: a selection of vehicles from the ARTECH collection and from private owners, offered for sale through the museum.',
        es:'Un servicio discreto para coleccionistas: una selección de vehículos de la colección ARTECH y de propietarios privados, ofrecidos en venta a través del museo.'},
  blocks:[
   {h:{en:'Private sales',es:'Venta privada'},p:[
    {en:'Every transaction is handled one to one, with full confidentiality and without public listings. Our team accompanies both parties from the first viewing to the final paperwork.',
     es:'Cada transacción se gestiona uno a uno, con total confidencialidad y sin anuncios públicos. Nuestro equipo acompaña a ambas partes desde la primera visita hasta la documentación final.'}]},
   {h:{en:'Valuation and provenance',es:'Tasación y procedencia'},p:[
    {en:'Each vehicle is reviewed by our specialists, who verify its history, documentation and state of preservation before it is offered.',
     es:'Cada vehículo es revisado por nuestros especialistas, que verifican su historia, documentación y estado de conservación antes de ser ofrecido.'}]},
   {h:{en:'Consignment',es:'Consignación'},p:[
    {en:'If you wish to sell a classic vehicle, we can exhibit it at the museum while we find the right buyer. Write to info@artech.pe to arrange an assessment.',
     es:'Si quieres vender un vehículo clásico, podemos exhibirlo en el museo mientras encontramos al comprador adecuado. Escribe a info@artech.pe para coordinar una evaluación.'}]}]},

 'p-visit':{
  t:{en:'Visitor information',es:'Información de visita'},
  lead:{en:'Everything you need to know before coming to ARTECH, fifteen minutes from Miraflores.',
        es:'Todo lo que necesitas saber antes de venir a ARTECH, a quince minutos de Miraflores.'},
  blocks:[
   {h:{en:'Hours and address',es:'Horario y dirección'},p:[
    {en:'Tuesday to Sunday, 9:00 a.m. to 7:00 p.m. Av. Huaylas 640, Chorrillos, Lima. Closed on Mondays and public holidays.',
     es:'Martes a domingo, de 9:00 a.m. a 7:00 p.m. Av. Huaylas 640, Chorrillos, Lima. Cerrado los lunes y feriados.'}]},
   {h:{en:'Getting here',es:'Cómo llegar'},p:[
    {en:'The museum is fifteen minutes from Miraflores by car along the Costa Verde. There are bus stops within a short walk and taxi services reach the entrance directly.',
     es:'El museo está a quince minutos de Miraflores en auto por la Costa Verde. Hay paraderos a pocos pasos y los servicios de taxi llegan directamente a la entrada.'}]},
   {h:{en:'Parking and amenities',es:'Estacionamiento y servicios'},p:[
    {en:'Free parking for visitors, step-free access throughout the exhibition halls, cloakroom and the restaurant on the same floor.',
     es:'Estacionamiento gratuito para visitantes, acceso sin escalones en todas las salas, guardarropa y el restaurante en el mismo nivel.'}]}]},

 'p-privacy':{
  t:{en:'Privacy',es:'Privacidad'},
  lead:{en:'ARTECH respects your privacy. This notice explains what personal data we collect, why we collect it and what rights you have over it.',
        es:'ARTECH respeta tu privacidad. Este aviso explica qué datos personales recogemos, por qué lo hacemos y qué derechos tienes sobre ellos.'},
  blocks:[
   {h:{en:'Who is responsible',es:'Quién es responsable'},p:[
    {en:'ARTECH, with premises at Av. Huaylas 640, Chorrillos, Lima, is responsible for the personal data collected through this website. For any query write to info@artech.pe.',
     es:'ARTECH, con local en Av. Huaylas 640, Chorrillos, Lima, es responsable de los datos personales recogidos a través de este sitio. Para cualquier consulta escribe a info@artech.pe.'}]}],
  acc:[
   {q:{en:'What data we collect',es:'Qué datos recogemos'},
    a:{en:'Only what you give us voluntarily: the name, email and message you enter in the contact form, and the email address you provide when subscribing to the newsletter.',
       es:'Solo lo que nos entregas voluntariamente: el nombre, correo y mensaje que escribes en el formulario de contacto, y el correo que indicas al suscribirte al boletín.'}},
   {q:{en:'How we use it',es:'Cómo los usamos'},
    a:{en:'To answer your inquiries, manage visit bookings and send you news about the museum if you have asked for it. We do not sell or transfer your data to third parties.',
       es:'Para responder tus consultas, gestionar reservas de visita y enviarte novedades del museo si lo has solicitado. No vendemos ni cedemos tus datos a terceros.'}},
   {q:{en:'How long we keep it',es:'Cuánto tiempo los conservamos'},
    a:{en:'For as long as the purpose that motivated the collection remains, and afterwards for the period required by applicable law.',
       es:'Mientras se mantenga la finalidad que motivó su recolección y, después, durante el plazo que exija la normativa aplicable.'}},
   {q:{en:'Your rights',es:'Tus derechos'},
    a:{en:'You may access, update, correct or delete your data, and withdraw your consent at any time, by writing to info@artech.pe.',
       es:'Puedes acceder, actualizar, rectificar o suprimir tus datos, y retirar tu consentimiento en cualquier momento, escribiendo a info@artech.pe.'}}]},

 'p-cookies':{
  t:{en:'Cookies',es:'Cookies'},
  lead:{en:'This site uses the minimum number of cookies needed for it to work properly and to understand how it is used.',
        es:'Este sitio usa la mínima cantidad de cookies necesaria para funcionar correctamente y entender cómo se utiliza.'},
  acc:[
   {q:{en:'What a cookie is',es:'Qué es una cookie'},
    a:{en:'A small file the site stores in your browser so it can remember choices such as the language you selected.',
       es:'Un archivo pequeño que el sitio guarda en tu navegador para recordar elecciones como el idioma que seleccionaste.'}},
   {q:{en:'Essential cookies',es:'Cookies esenciales'},
    a:{en:'They allow the site to function: they keep your language preference and the state of the sections you open. They cannot be disabled without affecting the experience.',
       es:'Permiten que el sitio funcione: guardan tu preferencia de idioma y el estado de las secciones que abres. No pueden desactivarse sin afectar la experiencia.'}},
   {q:{en:'Analytics cookies',es:'Cookies analíticas'},
    a:{en:'They help us know which sections are visited most, always in aggregate form and without identifying you personally.',
       es:'Nos ayudan a saber qué secciones se visitan más, siempre de forma agregada y sin identificarte personalmente.'}},
   {q:{en:'How to manage them',es:'Cómo gestionarlas'},
    a:{en:'You can delete or block cookies from your browser settings at any time. Doing so may affect some functions of the site.',
       es:'Puedes eliminar o bloquear las cookies desde la configuración de tu navegador en cualquier momento. Hacerlo puede afectar algunas funciones del sitio.'}}]},

 'p-legal':{
  t:{en:'Legal',es:'Legal'},
  lead:{en:'Terms governing the use of this website and the information published on it.',
        es:'Condiciones que rigen el uso de este sitio web y la información publicada en él.'},
  blocks:[
   {h:{en:'Company information',es:'Información de la empresa'},p:[
    {en:'This is the only official ARTECH website. The museum operates at Av. Huaylas 640, Chorrillos, Lima, Perú. Contact: info@artech.pe.',
     es:'Este es el único sitio web oficial de ARTECH. El museo opera en Av. Huaylas 640, Chorrillos, Lima, Perú. Contacto: info@artech.pe.'}]}],
  acc:[
   {q:{en:'Website terms',es:'Condiciones del sitio'},
    a:{en:'By accessing this website you agree to these terms. The site is for personal use and may not be used for commercial purposes without written authorization.',
       es:'Al acceder a este sitio aceptas estas condiciones. El sitio es para uso personal y no puede utilizarse con fines comerciales sin autorización escrita.'}},
   {q:{en:'Accuracy of the information',es:'Exactitud de la información'},
    a:{en:'We make every effort to keep the information on vehicles, hours and experiences up to date, but it may change without notice. Confirm any detail with us before your visit.',
       es:'Hacemos todo lo posible por mantener actualizada la información de vehículos, horarios y experiencias, pero puede cambiar sin aviso. Confirma cualquier detalle con nosotros antes de tu visita.'}},
   {q:{en:'Intellectual property',es:'Propiedad intelectual'},
    a:{en:'The photographs, texts and the ARTECH name are protected. They may not be reproduced without written permission from the museum.',
       es:'Las fotografías, los textos y el nombre ARTECH están protegidos. No pueden reproducirse sin permiso escrito del museo.'}},
   {q:{en:'External links',es:'Enlaces externos'},
    a:{en:'This site may link to third-party pages. ARTECH is not responsible for their content or their privacy practices.',
       es:'Este sitio puede enlazar a páginas de terceros. ARTECH no se responsabiliza de su contenido ni de sus prácticas de privacidad.'}},
   {q:{en:'Applicable law',es:'Ley aplicable'},
    a:{en:'These terms are governed by the laws of the Republic of Peru.',
       es:'Estas condiciones se rigen por las leyes de la República del Perú.'}}]},

 'p-faqs':{
  t:{en:'FAQs',es:'Preguntas frecuentes'},
  lead:{en:'The questions our visitors ask most often. If you do not find yours, write to info@artech.pe.',
        es:'Las preguntas que más nos hacen nuestros visitantes. Si no encuentras la tuya, escribe a info@artech.pe.'},
  acc:[
   {q:{en:'What are the opening hours?',es:'¿Cuál es el horario?'},
    a:{en:'Tuesday to Sunday, from 9:00 a.m. to 7:00 p.m. We are closed on Mondays and public holidays.',
       es:'Martes a domingo, de 9:00 a.m. a 7:00 p.m. Cerramos los lunes y feriados.'}},
   {q:{en:'Do I need to book in advance?',es:'¿Necesito reservar con anticipación?'},
    a:{en:'Not for a general visit. Private tours and group visits do need to be arranged in advance.',
       es:'No para una visita general. Los tours privados y las visitas de grupo sí deben coordinarse con anticipación.'}},
   {q:{en:'Is there parking?',es:'¿Hay estacionamiento?'},
    a:{en:'Yes, free parking for visitors at the museum entrance.',
       es:'Sí, estacionamiento gratuito para visitantes en la entrada del museo.'}},
   {q:{en:'Can I take photographs?',es:'¿Puedo tomar fotografías?'},
    a:{en:'Yes, for personal use. Professional shoots and filming require prior authorization.',
       es:'Sí, para uso personal. Las sesiones profesionales y las grabaciones requieren autorización previa.'}},
   {q:{en:'Is the museum accessible?',es:'¿El museo es accesible?'},
    a:{en:'The exhibition halls, the café and the toilets have step-free access.',
       es:'Las salas de exhibición, el café y los servicios higiénicos tienen acceso sin escalones.'}},
   {q:{en:'Can children visit?',es:'¿Pueden entrar niños?'},
    a:{en:'Of course. Children accompanied by an adult are welcome and have a reduced admission.',
       es:'Por supuesto. Los niños acompañados de un adulto son bienvenidos y tienen entrada reducida.'}},
   {q:{en:'Do I need a reservation for the restaurant?',es:'¿Necesito reserva para el restaurante?'},
    a:{en:'It is not essential, but we recommend it on weekends. Write to info@artech.pe to reserve a table.',
       es:'No es imprescindible, pero la recomendamos los fines de semana. Escribe a info@artech.pe para reservar una mesa.'}},
   {q:{en:'Can the museum be hired for events?',es:'¿Se puede alquilar el museo para eventos?'},
    a:{en:'Yes, we host private events among the collection. Write to info@artech.pe and we will send you the options.',
       es:'Sí, realizamos eventos privados entre la colección. Escribe a info@artech.pe y te enviamos las opciones.'}}]},

 'p-claims':{
  t:{en:'Complaints book',es:'Libro de reclamaciones'},
  lead:{en:'In accordance with Peruvian consumer protection law, ARTECH makes a complaints book available to its visitors.',
        es:'Conforme a la normativa peruana de protección al consumidor, ARTECH pone a disposición de sus visitantes un libro de reclamaciones.'},
  blocks:[
   {h:{en:'How to file a complaint',es:'Cómo presentar un reclamo'},p:[
    {en:'You may fill in the physical book available at the museum reception, or send us your case by email with your name, contact details and a description of what happened.',
     es:'Puedes llenar el libro físico disponible en la recepción del museo, o enviarnos tu caso por correo indicando tu nombre, datos de contacto y una descripción de lo ocurrido.'}]},
   {h:{en:'Response time',es:'Plazo de respuesta'},p:[
    {en:'We will acknowledge receipt within two working days and give you a substantive reply within the period established by law.',
     es:'Acusaremos recibo dentro de los dos días hábiles siguientes y te daremos una respuesta de fondo dentro del plazo que establece la ley.'}]},
   {h:{en:'Contact',es:'Contacto'},p:[
    {en:'ARTECH · Av. Huaylas 640, Chorrillos, Lima · info@artech.pe · +51 992 432 455',
     es:'ARTECH · Av. Huaylas 640, Chorrillos, Lima · info@artech.pe · +51 992 432 455'}]}]},

 'p-careers':{
  t:{en:'Careers',es:'Trabaja con nosotros'},
  lead:{en:'ARTECH brings together people who care for machines that outlive us. If that idea appeals to you, we would like to meet you.',
        es:'ARTECH reúne a personas que cuidan máquinas que nos sobreviven. Si esa idea te atrae, nos gustaría conocerte.'},
  blocks:[
   {h:{en:'What we look for',es:'Qué buscamos'},p:[
    {en:'Attention to detail, respect for the history of each piece and a genuine interest in looking after the visitor. Previous experience with classic vehicles is valued but not essential.',
     es:'Atención al detalle, respeto por la historia de cada pieza y un interés genuino por atender al visitante. Se valora la experiencia previa con vehículos clásicos, aunque no es indispensable.'}]},
   {h:{en:'Areas',es:'Áreas'},p:[
    {en:'Guides and visitor services, restoration and workshop, kitchen and dining room at the restaurant, communications and events.',
     es:'Guías y atención al visitante, restauración y taller, cocina y salón del restaurante, comunicaciones y eventos.'}]},
   {h:{en:'How to apply',es:'Cómo postular'},p:[
    {en:'Send your CV to info@artech.pe indicating the area that interests you. We review every application and reply to those that match an open position.',
     es:'Envía tu CV a info@artech.pe indicando el área que te interesa. Revisamos todas las postulaciones y respondemos a las que coinciden con una posición abierta.'}]}]},

 'p-press':{
  t:{en:'Press room',es:'Sala de prensa'},
  lead:{en:'Resources and contact for journalists, producers and media covering ARTECH.',
        es:'Recursos y contacto para periodistas, productores y medios que cubren ARTECH.'},
  blocks:[
   {h:{en:'Media inquiries',es:'Consultas de prensa'},p:[
    {en:'Write to info@artech.pe with the subject "Press" and tell us the medium, the angle of your piece and your deadline. We will get back to you as quickly as we can.',
     es:'Escribe a info@artech.pe con el asunto "Prensa" indicando el medio, el enfoque de tu nota y tu fecha de cierre. Te responderemos con la mayor rapidez posible.'}]},
   {h:{en:'Images and press kit',es:'Imágenes y kit de prensa'},p:[
    {en:'We have high-resolution photographs of the collection and of the museum halls available on request, for editorial use with credit.',
     es:'Contamos con fotografías en alta resolución de la colección y de las salas del museo, disponibles a solicitud, para uso editorial con crédito.'}]},
   {h:{en:'Filming at the museum',es:'Grabaciones en el museo'},p:[
    {en:'Shoots and filming are arranged outside opening hours so as not to affect the visit. Write to us with the dates and the technical requirements of your production.',
     es:'Las sesiones y grabaciones se coordinan fuera del horario de atención para no afectar la visita. Escríbenos con las fechas y los requerimientos técnicos de tu producción.'}]}]},

 'p-sustainability':{
  t:{en:'Sustainability',es:'Sostenibilidad'},
  lead:{en:'Preserving a vehicle is, in itself, an act of sustainability: it keeps in use what has already been made instead of replacing it.',
        es:'Conservar un vehículo es, en sí mismo, un acto de sostenibilidad: mantiene en uso lo que ya fue fabricado en lugar de reemplazarlo.'},
  blocks:[
   {h:{en:'Preservation before replacement',es:'Conservar antes que reemplazar'},p:[
    {en:'Our workshop repairs and reuses original parts wherever possible. Every component that returns to service is one that does not have to be manufactured again.',
     es:'Nuestro taller repara y reutiliza piezas originales siempre que es posible. Cada componente que vuelve a servicio es uno que no hay que fabricar de nuevo.'}]},
   {h:{en:'Energy and water',es:'Energía y agua'},p:[
    {en:'The halls use low-consumption lighting and the washing area recirculates water. We keep measuring our consumption in order to reduce it.',
     es:'Las salas usan iluminación de bajo consumo y la zona de lavado recircula el agua. Seguimos midiendo nuestro consumo para reducirlo.'}]},
   {h:{en:'Waste',es:'Residuos'},p:[
    {en:'Oils, batteries and solvents are handed to authorized managers. In the café we work with local suppliers to cut down on packaging.',
     es:'Aceites, baterías y solventes se entregan a gestores autorizados. En el café trabajamos con proveedores locales para reducir envases.'}]},
   {h:{en:'Community',es:'Comunidad'},p:[
    {en:'We open the museum to schools and technical institutes so that new generations can see up close the trades that keep these machines alive.',
     es:'Abrimos el museo a colegios e institutos técnicos para que nuevas generaciones conozcan de cerca los oficios que mantienen vivas estas máquinas.'}]}]},

 'p-club':{
  t:{en:'ARTECH Club',es:'ARTECH Club'},
  lead:{en:'A circle for those who want to stay close to the collection all year round.',
        es:'Un círculo para quienes quieren estar cerca de la colección durante todo el año.'},
  blocks:[
   {h:{en:'Benefits',es:'Beneficios'},p:[
    {en:'Unlimited access to the museum, invitations to private openings, priority booking for experiences and a permanent discount at the restaurant.',
     es:'Acceso ilimitado al museo, invitaciones a aperturas privadas, reserva prioritaria de experiencias y descuento permanente en el restaurante.'}]},
   {h:{en:'Members-only events',es:'Eventos solo para miembros'},p:[
    {en:'Evenings with the collection, workshop visits and conversations with the specialists who look after each vehicle.',
     es:'Noches con la colección, visitas al taller y conversaciones con los especialistas que cuidan cada vehículo.'}]},
   {h:{en:'How to join',es:'Cómo unirse'},p:[
    {en:'Membership is annual and personal. Write to info@artech.pe and we will send you the current conditions.',
     es:'La membresía es anual y personal. Escribe a info@artech.pe y te enviamos las condiciones vigentes.'}]}]},

 'p-sitemap':{
  t:{en:'Site map',es:'Mapa del sitio'},
  lead:{en:'Every section of this site, in one place.',
        es:'Todas las secciones de este sitio, en un solo lugar.'},
  links:[
   {h:{en:'The museum',es:'El museo'},items:[
    {k:'#top',t:{en:'Home',es:'Inicio'}},
    {k:'#p-collection',t:{en:'Collection',es:'Colección'}},
    {k:'#p-experience',t:{en:'Experiences',es:'Experiencias'}},
    {k:'#exp3d',t:{en:'360° tour',es:'Tour 360°'}},
    {k:'#p-cafe',t:{en:'Restaurant · Café · Bar',es:'Restaurante · Café · Bar'}}]},
   {h:{en:'Book your visit',es:'Reserva tu turno'},items:[
    {k:'#p-visit',t:{en:'Visitor information',es:'Información de visita'}},
    {k:'#p-tickets',t:{en:'Buy tickets',es:'Comprar entradas'}},
    {k:'#p-contact',t:{en:'Contact',es:'Contacto'}},
    {k:'#p-faqs',t:{en:'FAQs',es:'Preguntas frecuentes'}}]},
   {h:{en:'ARTECH',es:'ARTECH'},items:[
    {k:'#p-preowned',t:{en:'Vehicles for sale',es:'Vehículos en venta'}},
    {k:'#p-club',t:{en:'ARTECH Club',es:'ARTECH Club'}},
    {k:'#p-careers',t:{en:'Careers',es:'Trabaja con nosotros'}},
    {k:'#p-press',t:{en:'Press room',es:'Sala de prensa'}},
    {k:'#p-sustainability',t:{en:'Sustainability',es:'Sostenibilidad'}},
    {k:'#p-blog',t:{en:'Blog',es:'Blog'}}]},
   {h:{en:'Legal',es:'Legal'},items:[
    {k:'#p-legal',t:{en:'Legal',es:'Legal'}},
    {k:'#p-privacy',t:{en:'Privacy',es:'Privacidad'}},
    {k:'#p-cookies',t:{en:'Cookies',es:'Cookies'}},
    {k:'#p-claims',t:{en:'Complaints book',es:'Libro de reclamaciones'}}]}]}
};

function renderInfo(key){
  const d=INFO[key]; const host=document.getElementById('page-info');
  if(!d||!host) return;
  const L=(o)=>o ? (o[lang]||o.en||'') : '';
  const _t=(k,f)=>(typeof dict!=='undefined' && dict[lang] && dict[lang][k]) ? dict[lang][k] : f;
  let h='<div class="wrap">'
      + '<a href="#top" class="back-btn light">'+_t('back_home','← Back to Home')+'</a>'
      + '<h2 class="info-title">'+L(d.t)+'</h2>'
      + (d.lead?'<p class="info-lead">'+L(d.lead)+'</p>':'')
      + '</div><div class="info-body"><div class="wrap">';
  (d.blocks||[]).forEach(function(b){
    h+='<section class="info-sec"><h3>'+L(b.h)+'</h3>';
    (b.p||[]).forEach(function(p){ h+='<p>'+L(p)+'</p>'; });
    h+='</section>';
  });
  if(d.acc && d.acc.length){
    h+='<div class="info-acc">';
    d.acc.forEach(function(a,i){
      h+='<div class="acc-block"><button class="acc-q" type="button" aria-expanded="false" data-i2="'+i+'">'
        +'<span>'+L(a.q)+'</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>'
        +'<div class="acc-a"><p>'+L(a.a)+'</p></div></div>';
    });
    h+='</div>';
  }
  if(d.links){
    h+='<div class="info-map">';
    d.links.forEach(function(g){
      h+='<div class="map-col"><h3>'+L(g.h)+'</h3>';
      g.items.forEach(function(it){ h+='<a href="'+it.k+'">'+L(it.t)+'</a>'; });
      h+='</div>';
    });
    h+='</div>';
  }
  h+='</div></div>';
  host.innerHTML=h;
  host.querySelectorAll('.acc-q').forEach(function(b){
    b.addEventListener('click',function(){
      const bl=b.closest('.acc-block'); const abierto=bl.classList.toggle('open');
      b.setAttribute('aria-expanded', abierto?'true':'false');
    });
  });
}

/* el enlace LANGUAGE del pie alterna entre los dos idiomas */
(function(){
  const l=document.getElementById('ftLang'); if(!l) return;
  l.addEventListener('click',function(e){
    e.preventDefault();
    const otro = (typeof lang!=='undefined' && lang==='es') ? 'en' : 'es';
    const b=document.querySelector('.lang button[data-lang="'+otro+'"]');
    if(b) b.click(); else if(typeof apply==='function') apply(otro);
  });
})();

// internal pages router (same-window views: #p-experience / #p-collection)
const innerPages={ 'location':document.getElementById('location'), 'p-experience':document.getElementById('page-experience'), 'p-collection':document.getElementById('page-collection'), 'p-vehicle':document.getElementById('page-vehicle'), 'p-cafe':document.getElementById('page-cafe'), 'p-contact':document.getElementById('page-contact'), 'p-blog':document.getElementById('page-blog'), 'p-post':document.getElementById('page-post'), 'p-tickets':document.getElementById('page-tickets')  , 'p-workshops':document.getElementById('page-workshops'), 'p-affiliated':document.getElementById('page-affiliated'), 'p-history':document.getElementById('page-history') };
Object.keys(INFO).forEach(function(k){ innerPages[k]=document.getElementById('page-info'); });
innerPages['exp3d']=document.getElementById('exp3d');
/* los videos decorativos del home consumen CPU aunque estén ocultos:
   se pausan al abrir una página interna y vuelven al regresar */
function mediaDeFondo(encender){
  document.querySelectorAll('.hero-bg,.exp-bg').forEach(function(v){
    // V3 shell owns the hero's autoplay, user pause and scene visibility.
    if(v.id==='heroVid')return;
    try{
      if(encender && v.dataset.userPaused!=='1'){ delete v.dataset.off; v.play().catch(function(){}); }
      else { v.dataset.off='1'; v.pause(); }      // marca la pausa como intencional
    }catch(e){}
  });
}
function updatePageMetadata() {
  const { key } = parseHash(location.hash);
  const page = innerPages[key];
  const heading = page?.querySelector('h1,h2,.info-title');
  const title = (heading?.textContent || (lang === 'es' ? 'Museo del Automóvil' : 'Classic Car Museum')).trim();
  document.title = `${title} · ARTECH · Lima`;
  const car = CARS.find(c => c.slug === currentSlug);
  const description = key === 'p-vehicle' && car
    ? ((lang === 'es' ? car.desc_es : car.desc) || car.desc || '')
    : (page?.querySelector('.editorial-lead,.pc-lead,.info-lead,.tk-head p,.xp-head p,.cafe-lead,.contact-head p')?.textContent
      || dict[lang].hero_sub);
  document.querySelector('meta[name="description"]').content = description.trim();
}
function route(options = {}) {
  const parsed = parseHash(location.hash);
  let { key, id } = parsed;
  if (key === 'p-vehicle' && !id) { history.replaceState(null, '', '#p-collection'); key = 'p-collection'; }
  if (key === 'p-post' && (!id || !BLOG.some(post => post.id === id))) {
    history.replaceState(null, '', '#p-blog'); key = 'p-blog';
  }
  if (key === 'p-vehicle' && carsStatus === 'ready' && !CARS.some(car => car.slug === id)) {
    history.replaceState(null, '', '#p-collection'); key = 'p-collection';
    window.__toast?.(dict[lang].vehicle_missing);
  }
  let page = innerPages[key];
  if (!page && key !== 'top' && !document.getElementById(key)) {
    history.replaceState(null, '', '#top'); key = 'top';
    window.__toast?.(dict[lang].route_missing);
  }
  page = innerPages[key];
  const wasOpen = document.body.classList.contains('page-open');
  document.body.classList.toggle('page-open', !!page);
  [['on-tickets','p-tickets'],['on-experience','p-experience'],['on-collection','p-collection'],
    ['on-cafe','p-cafe'],['on-360','exp3d']].forEach(([cls, routeKey]) => document.body.classList.toggle(cls, key === routeKey));
  document.body.classList.toggle('on-info', !!INFO[key]);
  Object.values(innerPages).forEach(el => el?.classList.remove('active'));
  if (page) {
    page.classList.add('active');
    if(INFO[key]) renderInfo(key);
    if(key==='p-workshops') renderTalleres();
    if(key==='p-experience') renderExperiencias();
    if(key==='p-post') showPost(id);
    if(key==='p-vehicle' && carsStatus==='ready') showVehicle(id);
    if(key==='p-vehicle' && carsStatus!=='ready') {
      document.getElementById('vhName').textContent = dict[lang][carsStatus==='error'?'catalogue_error':'catalogue_loading'];
    }
    page.querySelectorAll('img[data-src]').forEach(im => { im.src=im.dataset.src; im.removeAttribute('data-src'); });
    window.scrollTo({top:0,behavior:'instant'});
    if(key==='exp3d') window.dispatchEvent(new Event('resize'));
  } else {
    const target = document.getElementById(key);
    if(target && (wasOpen || options.focus)) {
      if(target.closest('.v3-scene')&&window.ArtechMotion)window.ArtechMotion.reveal(target);
      else target.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});
    }
  }
  mediaDeFondo(!page && !reducedMotion.matches);
  document.querySelectorAll('#navlinks a').forEach(link => {
    const active = parseHash(link.hash).key === key;
    link.classList.toggle('current', active);
    if(active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
  if(options.focus) {
    const heading = (page || document.getElementById(key))?.querySelector('h1,h2');
    if(heading){ heading.tabIndex=-1; heading.focus({preventScroll:true}); }
  }
  window.dispatchEvent(new Event('artech:route'));
  updatePageMetadata();
}
addEventListener('hashchange', () => route({ focus: true }));

// Full-screen navigation is managed by v3-shell.js.

// (3D turntable is now a real Three.js scene — see the module script below)
// ===== data-driven collection (95 cars) + per-car data sheet =====

function realPlate(p){ return p && !/^S\s*I/i.test(p.trim()); }
function carCard(c, cls) {
  const disp = c.name || c.plate;
  const year = parseInt(c.year,10), category = year && year >= 1990 ? 'modern' : 'classic';
  const search = [disp,c.plate,c.brand,c.model,c.year].filter(Boolean).join(' ').toLowerCase();
  return `<a class="col-card c-item${cls||''}" href="#p-vehicle/${encodeURIComponent(c.slug)}"
    data-name="${escapeHTML(search)}" data-brand="${escapeHTML(c.brand)}" data-cat="${category}" data-slug="${escapeHTML(c.slug)}">
    <div class="ph"><picture><source media="(max-width:650px)" srcset="assets/cars/${c.slug}/thumb.jpg"><img src="assets/cars/${c.slug}/cover.jpg" alt="${escapeHTML(disp)}" loading="lazy" decoding="async"></picture></div>
    <div class="body"><h4>${escapeHTML(disp)}</h4><p class="c-meta">${escapeHTML([c.brand,c.year].filter(Boolean).join(' · '))}</p>
    <span class="link-arrow"><span data-i="visit_info">${dict[lang].visit_info}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></a>`;
}
// MH04–MH06: catalogue facts and honest media controls for the homepage.
function renderHome() {
  const t = dict[lang], hook = document.getElementById('homeHeroHook');
  const years = CARS.map(car => Number.parseInt(car.year, 10)).filter(Number.isFinite);
  if (hook) hook.textContent = years.length
    ? t.h_hero_hook.replace('{age}', Number(todayInLima().slice(0, 4)) - Math.min(...years))
    : t.h_hook_fallback;
  const video = document.getElementById('heroVid'), toggle = document.getElementById('homeVideoToggle');
  if (toggle && video) {
    toggle.setAttribute('aria-label', t[video.error ? 'h_video_failed' : video.paused ? 'h_video_play' : 'h_video_pause']);
    toggle.setAttribute('aria-pressed', String(!video.paused));
    toggle.classList.toggle('is-playing', !video.paused);
    toggle.disabled = !!video.error;
  }
  const oldest = document.getElementById('v3OldestTitle'), note = document.getElementById('v3OldestNote');
  if (oldest) oldest.textContent = years.length
    ? (lang === 'es' ? 'EL RECORRIDO\nCOMIENZA EN ' : 'THE JOURNEY\nBEGINS IN ') + Math.min(...years) + '.'
    : (lang === 'es' ? 'LA HISTORIA\nDEL AUTOMÓVIL.' : 'THE HISTORY\nOF THE AUTOMOBILE.');
  if (note) note.textContent = years.length
    ? (lang === 'es' ? 'La pieza más antigua del catálogo tiene ' : 'The oldest car in the catalogue is ') + (Number(todayInLima().slice(0,4))-Math.min(...years)) + (lang === 'es' ? ' años.' : ' years old.') : '';

}

function renderCollections(){
  const home=document.getElementById('homeGrid');
  if(home) home.innerHTML=CARS.slice(0,12).map(c=>carCard(c)).join('');
  const grid=document.getElementById('carGrid');
  if(grid) grid.innerHTML=CARS.map(c=>carCard(c)).join('');
}
function hcScroll(dir){const g=document.getElementById('homeGrid');if(!g)return;const card=g.querySelector('.col-card');const step=card?card.getBoundingClientRect().width+20:300;g.scrollBy({left:dir*step,behavior:'smooth'});}
// ===== Carta del restaurante (acordeon) =====
const CAFE_MENU=[
 {t:{en:'Salads',es:'Ensaladas'},items:[
   {n:'Burrata Capresse',d:'Tomate, pesto, pistachos, reducción de balsámico, arúgula, cilantro, aceite de oliva. (extra jamón serrano s/)'},
   {n:'Ensalada de Cangrejo',d:'Pulpa de cangrejo, pepino rallado, zanahoria rayada, mayonesa de la casa, cebolla crocante.'},
   {n:'Ensalada César',d:'Mix de lechugas, parmesano reggiano, tocino, crotones de poro gluten free. (extra pollo s/)'}]},
 {t:{en:'Soups & Creams',es:'Sopas y Cremas'},items:[
   {n:'Crema de Racacha',d:''},{n:'Sopa de la Semana',d:''}]},
 {t:{en:'Sides & Extras',es:'Acompañamientos y Extras'},items:[
   {n:'Papas Trufadas y Parmesano',d:'Parmesano rallado, perejil y trufa blanca.'},
   {n:'Verduras a la Parrilla',d:'Espárragos, loche, zucchini, tomate cherry, champiñones.'},
   {n:'Ensaladita Fresca ARTECH',d:''}]},
 {t:{en:'To Share',es:'Para Picar'},items:[
   {n:'Dip de Cangrejo Caliente',d:'Relleno dentro de un pan de masa madre.'},
   {n:'Tartare de Atún',d:'Atún, ajonjolí, alcaparras, palta y mango.'},
   {n:'Mollejas USA',d:''},
   {n:'Tequeños de Queso Cajamarquino',d:'Queso auténtico cajamarquino artesanal pasteurizado, guacamole.'},
   {n:'Bolitas de Racacha',d:'Tubérculo de la selva, relleno de jamón serrano y queso, acompañado de salsa huacatay.'},
   {n:'Tortilla de Langostinos',d:'Huevos batidos, langostinos jumbo, salsa criolla y pan cortado.'},
   {n:'Pulpo Parrillero',d:'Pulpo a la parrilla acompañado de puré de racacha.'},
   {n:'Cebiche al Estilo ARTECH',d:'Pesca del día, camote confitado, choclo, palta, cebolla, canchita, todo al limón.'}]},
 {t:{en:'Mains',es:'Segundos'},items:[
   {n:'Penne con Tomates Confitados y Pulpo',d:'Pulpo, tomates secos al ajo, parmesano reggiano.'},
   {n:'Ravioles de la Semana',d:'Pregunta por nuestro especial del día.'},
   {n:'Lasagna de la Semana',d:'Pregunta por nuestro especial del día.'},
   {n:'Bife Americano a la Parrilla',d:'Acompañado de papas fritas y ensaladita fresca.'},
   {n:'Panceta Laqueada en Salsa Miso y Chaufa',d:'Jugosa y crocante panceta montada sobre un arroz chaufa.'},
   {n:'Atún en Costra de Pimienta',d:'Acompañado de puré de racacha, verduras parrilleras.'},
   {n:'Seco de Pescado',d:'Plato del norte, acompañado de yuca y arroz.'}]},
 {t:{en:'Breakfast',es:'Desayunos'},items:[
   {n:'Huevos Benedictos ARTECH',d:'Tostón de pan campesino, tocino, huevos escalfados, palta y salsa holandesa.'},
   {n:'Tostón de Pesto',d:'Tomates confitados, pesto, queso de cabra.'},
   {n:'Huevos Revueltos, Escalfados o Fritos',d:'Acompañados de tostadas de pan campesino. (extra tocino / jamón serrano / mantequilla y mermelada de frambuesas s/)'}]},
 {t:{en:'Sandwiches & Breads',es:'Sándwiches y Panes'},items:[
   {n:'Hamburguesa en Pan de Camote (Gluten Free)',d:'Casera de res, lechuga, tomate, cheddar, tocino.'},
   {n:'Butifarra',d:'Jamón del país, salsa criolla, mayonesa de la casa y Dijon.'},
   {n:'Hamburguesa de Atún',d:'Trozos de atún término medio, palta, mayonesa de la casa, sacha tomate, echalottes.'},
   {n:'Sándwich de Panceta',d:'Panceta laqueada en salsa miso, mayonesa de ajo confitado, nabo encurtido y salsa chalaca.'},
   {n:'Croissant',d:'Jamón y queso · mantequilla.'},
   {n:'Croque Madame',d:'Pan campesino, jamón inglés, queso y salsa bechamel, huevo frito a la inglesa.'}]},
 {t:{en:'Desserts',es:'Postres'},items:[
   {n:'Suspiro de Lúcuma',d:''},
   {n:'Keke de Zanahoria (Gluten Free)',d:'Helado de vainilla y frosting de queso crema.'},
   {n:'Crocante de Manzana',d:'Helado de vainilla.'},
   {n:'Pie de Limón',d:''},
   {n:'Soufflé de Chocolate',d:'Helado de vainilla y culí de frambuesas.'},
   {n:'Brownies y Blondies (Gluten Free)',d:''}]},
 {t:{en:'Hot Drinks',es:'Bebidas Calientes'},items:[
   {n:'Espresso',d:''},{n:'Cappuccino',d:''},{n:'Americano',d:''},
   {n:'Manzanilla, Hierba Luisa o Menta Naturales',d:''},{n:'Chocolate Caliente ARTECH',d:''}]},
 {t:{en:'Cold Drinks, Milkshakes & Juices',es:'Bebidas Frías, Milkshakes y Jugos'},items:[
   {n:'Latte',d:''},
   {n:'Milkshake de Vainilla, Chocolate, Fresa o Lúcuma',d:''},
   {n:'Jugo de Naranja, Fresa o Lúcuma',d:''},
   {n:'Limonada · Limonada de Hierba Luisa',d:''},
   {n:'Maracuyá · Chicha Morada',d:''},
   {n:'Coca Cola · Inka Cola · Agua',d:''}]},
 {t:{en:'Bar — Wines, Cocktails & Beers',es:'Bar — Vinos, Cócteles y Cervezas'},items:[
   {n:'Vinos',d:'Tinto · Blanco · Rosé.'},
   {n:'Cócteles',d:'Pisco Sour · Pisco Punch de Chicha · Maracuyá Sour.'},
   {n:'Cervezas',d:'Artesanal · Pilsen · Heineken.'}]}
];
const CAFE_EN={
 'Burrata Capresse':{n:'Burrata Capresse',d:'Tomato, pesto, pistachios, balsamic reduction, arugula, cilantro, olive oil. (add Serrano ham)'},
 'Ensalada de Cangrejo':{n:'Crab Salad',d:'Crab meat, grated cucumber and carrot, house mayonnaise, crispy onion.'},
 'Ensalada César':{n:'Caesar Salad',d:'Mixed lettuce, Parmesan, bacon, gluten-free leek croutons. (add chicken)'},
 'Crema de Racacha':{n:'Arracacha Cream Soup',d:''},
 'Sopa de la Semana':{n:'Soup of the Week',d:''},
 'Papas Trufadas y Parmesano':{n:'Truffled Parmesan Fries',d:'Grated Parmesan, parsley and white truffle.'},
 'Verduras a la Parrilla':{n:'Grilled Vegetables',d:'Asparagus, loche squash, zucchini, cherry tomato, mushrooms.'},
 'Ensaladita Fresca ARTECH':{n:'ARTECH Fresh Side Salad',d:''},
 'Dip de Cangrejo Caliente':{n:'Warm Crab Dip',d:'Served inside a sourdough loaf.'},
 'Tartare de Atún':{n:'Tuna Tartare',d:'Tuna, sesame, capers, avocado and mango.'},
 'Mollejas USA':{n:'USDA Sweetbreads',d:''},
 'Tequeños de Queso Cajamarquino':{n:'Cajamarca Cheese Tequeños',d:'Artisan pasteurized Cajamarca cheese, guacamole.'},
 'Bolitas de Racacha':{n:'Arracacha Croquettes',d:'Jungle tuber filled with Serrano ham and cheese, huacatay sauce.'},
 'Tortilla de Langostinos':{n:'Prawn Omelette',d:'Beaten eggs, jumbo prawns, criolla salsa and toasted bread.'},
 'Pulpo Parrillero':{n:'Grilled Octopus',d:'Grilled octopus with arracacha purée.'},
 'Cebiche al Estilo ARTECH':{n:'ARTECH-Style Ceviche',d:'Catch of the day, candied sweet potato, corn, avocado, onion, cancha, all in lime.'},
 'Penne con Tomates Confitados y Pulpo':{n:'Penne with Confit Tomato & Octopus',d:'Octopus, garlic sun-dried tomatoes, Parmesan reggiano.'},
 'Ravioles de la Semana':{n:'Ravioli of the Week',d:'Ask for our daily special.'},
 'Lasagna de la Semana':{n:'Lasagna of the Week',d:'Ask for our daily special.'},
 'Bife Americano a la Parrilla':{n:'Grilled American Steak',d:'Served with fries and a fresh side salad.'},
 'Panceta Laqueada en Salsa Miso y Chaufa':{n:'Miso-Glazed Pork Belly with Chaufa',d:'Juicy, crisp pork belly over chaufa fried rice.'},
 'Atún en Costra de Pimienta':{n:'Pepper-Crusted Tuna',d:'Served with arracacha purée and grilled vegetables.'},
 'Seco de Pescado':{n:'Northern Fish Seco',d:'A northern-Peru classic, served with cassava and rice.'},
 'Huevos Benedictos ARTECH':{n:'ARTECH Eggs Benedict',d:'Country-bread toast, bacon, poached eggs, avocado and hollandaise.'},
 'Tostón de Pesto':{n:'Pesto Toast',d:'Confit tomato, pesto, goat cheese.'},
 'Huevos Revueltos, Escalfados o Fritos':{n:'Eggs Your Way — Scrambled, Poached or Fried',d:'Served with country-bread toast. (add bacon / Serrano ham / butter & raspberry jam)'},
 'Hamburguesa en Pan de Camote (Gluten Free)':{n:'Sweet-Potato Bun Burger (Gluten Free)',d:'House beef patty, lettuce, tomato, cheddar, bacon.'},
 'Butifarra':{n:'Butifarra — Peruvian Ham Sandwich',d:'Country ham, criolla salsa, house mayo and Dijon.'},
 'Hamburguesa de Atún':{n:'Tuna Burger',d:'Medium-rare tuna, avocado, house mayo, sacha tomato, shallots.'},
 'Sándwich de Panceta':{n:'Pork Belly Sandwich',d:'Miso-glazed pork belly, confit-garlic mayo, pickled turnip and chalaca salsa.'},
 'Croissant':{n:'Croissant',d:'Ham & cheese · butter.'},
 'Croque Madame':{n:'Croque Madame',d:'Country bread, English ham, cheese and béchamel, fried egg.'},
 'Suspiro de Lúcuma':{n:'Lúcuma Suspiro',d:''},
 'Keke de Zanahoria (Gluten Free)':{n:'Carrot Cake (Gluten Free)',d:'Vanilla ice cream and cream-cheese frosting.'},
 'Crocante de Manzana':{n:'Apple Crumble',d:'Vanilla ice cream.'},
 'Pie de Limón':{n:'Lime Pie',d:''},
 'Soufflé de Chocolate':{n:'Chocolate Soufflé',d:'Vanilla ice cream and raspberry coulis.'},
 'Brownies y Blondies (Gluten Free)':{n:'Brownies & Blondies (Gluten Free)',d:''},
 'Espresso':{n:'Espresso',d:''},'Cappuccino':{n:'Cappuccino',d:''},'Americano':{n:'Americano',d:''},
 'Manzanilla, Hierba Luisa o Menta Naturales':{n:'Chamomile, Lemon Verbena or Fresh Mint Tea',d:''},
 'Chocolate Caliente ARTECH':{n:'ARTECH Hot Chocolate',d:''},
 'Latte':{n:'Latte',d:''},
 'Milkshake de Vainilla, Chocolate, Fresa o Lúcuma':{n:'Vanilla, Chocolate, Strawberry or Lúcuma Milkshake',d:''},
 'Jugo de Naranja, Fresa o Lúcuma':{n:'Orange, Strawberry or Lúcuma Juice',d:''},
 'Limonada · Limonada de Hierba Luisa':{n:'Lemonade · Lemon-Verbena Lemonade',d:''},
 'Maracuyá · Chicha Morada':{n:'Passion Fruit · Chicha Morada (Purple Corn)',d:''},
 'Coca Cola · Inka Cola · Agua':{n:'Coca-Cola · Inca Kola · Water',d:''},
 'Vinos':{n:'Wines',d:'Red · White · Rosé.'},
 'Cócteles':{n:'Cocktails',d:'Pisco Sour · Chicha Pisco Punch · Passion Fruit Sour.'},
 'Cervezas':{n:'Beers',d:'Craft · Pilsen · Heineken.'}
};
function renderCafeMenu(){
  const host=document.getElementById('cafeMenu'); if(!host) return;
  const L=(typeof lang!=='undefined'&&lang==='es')?'es':'en';
  const openCategories=[...host.querySelectorAll('.cm-block')].map((el,index)=>el.classList.contains('open')?index:-1);
  host.innerHTML=CAFE_MENU.map((cat,index)=>{
    const items=cat.items.map(it=>{const en=CAFE_EN[it.n]||{}; const nm=(L==='en'&&en.n)?en.n:it.n; const ds=(L==='en')?(en.d||''):(it.d||''); return `<div class="cm-item"><div class="in">${nm}</div>${ds?`<div class="id">${ds}</div>`:''}</div>`;}).join('');
    return `<div class="cm-block${openCategories.includes(index)?' open':''}"><button class="cm-cat" type="button" aria-expanded="${openCategories.includes(index)}" aria-controls="menu-category-${index}"><span class="cm-name">${cat.t[L]}</span><span class="cm-right"><span class="cm-count">${cat.items.length}</span><svg class="cm-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span></button><div class="cm-items" id="menu-category-${index}"><div class="cm-list">${items}</div></div></div>`;
  }).join('');
}
document.addEventListener('click',e=>{const b=e.target.closest('.cm-cat');if(!b)return;b.setAttribute('aria-expanded',String(b.closest('.cm-block').classList.toggle('open')));});
// ===== Blog / Journal (SEO articles) =====
const BLOG=[
 {id:'oldest-car',cat:{en:'Heritage',es:'Patrimonio'},read:4,date:'Aug 2026',
  title:{en:"The World's Oldest Car: Where Motoring Began",es:"El auto más antiguo del mundo: donde nació el automovilismo"},
  excerpt:{en:"How a single surviving machine connects us to the very dawn of the automobile.",es:"Cómo una sola máquina sobreviviente nos conecta con el nacimiento del automóvil."},
  body:["Few objects capture the birth of an entire industry like the world's oldest surviving automobile. Built in an age of steam and horse-drawn carriages, it marks the exact moment humanity chose the engine over the stable.","Preserving a machine of this age is a science in itself. Every bolt, timber and drop of oil is documented and protected, because originality — not restoration — is what makes it priceless.","At ARTECH in Lima, visitors stand face to face with this living origin point. It is not simply a car; it is the first chapter of a story that now includes hypercars, Le Mans winners and electric pioneers.","Understanding the oldest car is understanding ourselves: our restlessness, our love of movement and our endless pursuit of the next horizon."],
  bodyEs:["Pocos objetos capturan el nacimiento de toda una industria como el automóvil más antiguo que sobrevive en el mundo. Construido en una era de vapor y carruajes tirados por caballos, marca el momento exacto en que la humanidad eligió el motor por encima del establo.","Preservar una máquina de esta antigüedad es una ciencia en sí misma. Cada perno, cada madera y cada gota de aceite se documenta y protege, porque la originalidad —no la restauración— es lo que la hace invaluable.","En ARTECH, en Lima, los visitantes se encuentran cara a cara con este punto de origen vivo. No es simplemente un auto; es el primer capítulo de una historia que hoy incluye hiperdeportivos, ganadores de Le Mans y pioneros eléctricos.","Comprender el auto más antiguo es comprendernos a nosotros mismos: nuestra inquietud, nuestro amor por el movimiento y nuestra búsqueda infinita del siguiente horizonte."]},
 {id:'porsche-lima',cat:{en:'Collection',es:'Colección'},read:5,date:'Aug 2026',
  title:{en:"A Rare Porsche Collection in the Heart of Lima",es:"Una rara colección Porsche en el corazón de Lima"},
  excerpt:{en:"From the air-cooled 930 Turbo to the GT3 RS — why Porsche defines the collector's dream.",es:"Del 930 Turbo refrigerado por aire al GT3 RS: por qué Porsche define el sueño del coleccionista."},
  body:["No marque inspires devotion quite like Porsche. Its engineering philosophy — lightweight, rear-engined and relentlessly refined — has produced some of the most collectible cars on earth.","ARTECH's collection traces that evolution: the raw, turbocharged 930 that earned the nickname 'widow-maker', the last air-cooled 993, and the track-bred 991 GT3 RS with its towering rear wing.","For collectors in Peru and across South America, seeing these cars together is rare. Each represents a different answer to the same question Porsche has asked for decades: how do you make a driver's car faster without losing its soul?","Whether you are a lifelong enthusiast or discovering the badge for the first time, the Porsche hall is where passion meets precision."],
  bodyEs:["Ninguna marca inspira una devoción como Porsche. Su filosofía de ingeniería —ligera, con motor trasero e incansablemente refinada— ha producido algunos de los autos más coleccionables del planeta.","La colección de ARTECH recorre esa evolución: el bruto 930 turbo que se ganó el apodo de 'viuda-negra', el último 993 refrigerado por aire y el 991 GT3 RS de raza pista con su imponente alerón trasero.","Para los coleccionistas del Perú y de toda Sudamérica, ver estos autos juntos es poco común. Cada uno representa una respuesta distinta a la misma pregunta que Porsche se ha hecho por décadas: ¿cómo haces un auto más rápido sin perder su alma?","Seas un entusiasta de toda la vida o descubras la marca por primera vez, la sala Porsche es donde la pasión se encuentra con la precisión."]},
 {id:'restoration',cat:{en:'Restoration',es:'Restauración'},read:6,date:'Jul 2026',
  title:{en:"The Craft of Classic Car Restoration",es:"El arte de la restauración de autos clásicos"},
  excerpt:{en:"Inside the patient, painstaking work of bringing a century-old machine back to life.",es:"El trabajo paciente y minucioso de devolver la vida a una máquina centenaria."},
  body:["Restoration is equal parts engineering, history and art. A single pre-war car can take thousands of hours: sourcing period-correct parts, hand-forming panels and rebuilding engines that no factory has supported in seventy years.","The hardest decisions are philosophical. How much do you replace? A true restorer preserves originality wherever possible, because patina and honest wear are part of a car's story.","In Lima, ARTECH's team blends traditional coachbuilding skills with modern diagnostics — respecting the past while ensuring every vehicle can still run.","The result is not a museum piece frozen in time, but a living machine, ready to start, idle and move exactly as its makers intended."],
  bodyEs:["La restauración es a partes iguales ingeniería, historia y arte. Un solo auto de preguerra puede tomar miles de horas: conseguir piezas fieles a la época, formar paneles a mano y reconstruir motores que ninguna fábrica ha soportado en setenta años.","Las decisiones más difíciles son filosóficas. ¿Cuánto reemplazas? Un buen restaurador preserva la originalidad siempre que puede, porque la pátina y el desgaste honesto son parte de la historia del auto.","En Lima, el equipo de ARTECH combina técnicas tradicionales de carrocería con diagnóstico moderno: respeta el pasado mientras asegura que cada vehículo siga funcionando.","El resultado no es una pieza de museo congelada en el tiempo, sino una máquina viva, lista para arrancar, ralentizar y moverse tal como sus creadores lo imaginaron."]},
 {id:'muscle',cat:{en:'Icons',es:'Íconos'},read:4,date:'Jul 2026',
  title:{en:"American Muscle: Power, Chrome and Rebellion",es:"Muscle americano: potencia, cromo y rebeldía"},
  excerpt:{en:"The Challenger, the Mustang and the Hemi V8 — how Detroit turned horsepower into culture.",es:"El Challenger, el Mustang y el Hemi V8: cómo Detroit convirtió la potencia en cultura."},
  body:["In the late 1960s, American manufacturers discovered a simple formula: take a mid-size body, drop in the biggest possible V8, and sell it to a generation that wanted speed and attitude.","The result was the muscle car — the Dodge Challenger R/T, the Plymouth with its legendary Hemi, the Mustang in every guise from Fox-body to Shelby. Loud, proud and gloriously excessive.","These cars were never about subtlety. They were about the quarter mile, the drive-in and the freedom of the open road, and they remain some of the most sought-after classics today.","ARTECH's muscle collection captures that spirit — chrome bumpers, bold stripes and engines that still shake the ground."],
  bodyEs:["A finales de los años sesenta, los fabricantes estadounidenses descubrieron una fórmula simple: toma una carrocería mediana, métele el V8 más grande posible y véndelo a una generación que quería velocidad y actitud.","El resultado fue el muscle car: el Dodge Challenger R/T, el Plymouth con su legendario Hemi, el Mustang en todas sus formas, del Fox-body al Shelby. Ruidosos, orgullosos y gloriosamente excesivos.","Estos autos nunca fueron sutiles. Se trataba del cuarto de milla, del autocine y de la libertad de la carretera abierta, y hoy siguen siendo de los clásicos más buscados.","La colección de muscle de ARTECH captura ese espíritu: parachoques cromados, franjas audaces y motores que aún hacen temblar el suelo."]},
 {id:'prewar',cat:{en:'Icons',es:'Íconos'},read:5,date:'Jun 2026',
  title:{en:"Pre-War Grandeur: Packard, Auburn and the Golden Age",es:"Grandeza de preguerra: Packard, Auburn y la época dorada"},
  excerpt:{en:"When cars were coachbuilt jewels and elegance was measured in inches of chrome.",es:"Cuando los autos eran joyas carrozadas y la elegancia se medía en centímetros de cromo."},
  body:["Before the Second World War, the finest automobiles were built like couture. Marques such as Packard, Auburn and Cadillac created coachbuilt masterpieces for royalty, film stars and industrialists.","Straight-eight engines ran with legendary smoothness. Supercharged Auburns guaranteed 100 mph in an era when most roads were unpaved. Every phaeton and limousine was a statement of status and craftsmanship.","These cars defined the Golden Age of motoring — a brief, dazzling period when design, engineering and ambition reached a peak that many enthusiasts still consider unmatched.","To walk among them at ARTECH is to step into the 1930s, when the automobile was the ultimate symbol of progress."],
  bodyEs:["Antes de la Segunda Guerra Mundial, los mejores automóviles se construían como alta costura. Marcas como Packard, Auburn y Cadillac creaban obras maestras carrozadas para la realeza, estrellas de cine e industriales.","Los motores de ocho cilindros en línea funcionaban con una suavidad legendaria. Los Auburn sobrealimentados garantizaban 160 km/h en una época en que la mayoría de los caminos no estaban pavimentados. Cada phaeton y limusina era una declaración de estatus y artesanía.","Estos autos definieron la época dorada del automovilismo: un periodo breve y deslumbrante en el que diseño, ingeniería y ambición alcanzaron una cima que muchos entusiastas aún consideran insuperable.","Caminar entre ellos en ARTECH es entrar a los años treinta, cuando el automóvil era el máximo símbolo de progreso."]},
 {id:'cafe',cat:{en:'Café',es:'Café'},read:3,date:'Jun 2026',
  title:{en:"Signature Cuisine by Chef Carla Navea",es:"Cocina de autor de la Chef Carla Navea"},
  excerpt:{en:"A contemporary kitchen inside the Museum, where classic cars meet contemporary cuisine.",es:"Una cocina contemporánea dentro del Museo, donde los clásicos se encuentran con la alta cocina."},
  body:["A visit to ARTECH is not only about cars. Inside the Museum, the restaurant by Chef Carla Navea serves a signature menu built on Peru's extraordinary produce.","Think burrata capresse alongside cebiche al estilo ARTECH; truffled potatoes beside a slow-laquered pork chaufa. The result is honest, seasonal and rooted in Peru's extraordinary produce.","Open Tuesday to Sunday from 9 am to 7 pm, the café is a destination in its own right — perfect before or after a guided tour.","It is the kind of place where a coffee turns into lunch, and lunch turns into an afternoon surrounded by automotive history."],
  bodyEs:["Una visita a ARTECH no es solo sobre autos. Dentro del Museo, el restaurante de la Chef Carla Navea ofrece una carta de cocina de autor construida sobre el extraordinario producto peruano.","Imagina una burrata capresse junto a un cebiche al estilo ARTECH; papas trufadas al lado de una panceta laqueada sobre chaufa. El resultado es honesto, de estación y arraigado en el extraordinario producto peruano.","Abierto de martes a domingo de 9 am a 7 pm, el café es un destino por sí mismo, perfecto antes o después de un tour guiado.","Es de esos lugares donde un café se convierte en almuerzo, y el almuerzo en una tarde rodeada de historia del automóvil."]},
 {id:'visit-guide',cat:{en:'Visit',es:'Visita'},read:5,date:'May 2026',
  title:{en:"Visiting a Classic Car Museum in Lima: A Complete Guide",es:"Visitar un museo de autos clásicos en Lima: guía completa"},
  excerpt:{en:"Hours, location, tickets and tips for the best classic car experience in Lima, Peru.",es:"Horarios, ubicación, entradas y consejos para la mejor experiencia de autos clásicos en Lima."},
  body:["Planning a visit is easy. ARTECH is located on Av. Huaylas 640 in Chorrillos, in a permanent covered exhibition hall with parking for visitors.","The Museum is open Tuesday to Sunday, 9 am to 7 pm. Staff are English-speaking and credit cards are accepted, making it a comfortable stop for international travelers.","For the best experience, allow at least two hours: one for the collection and one for the restaurant. Private and group tours can be booked in advance for a deeper, guided journey.","Whether you are a lifelong petrolhead or simply looking for one of the most unusual things to do in Lima, the collection rewards every kind of visitor."],
  bodyEs:["Planificar la visita es fácil. ARTECH está en la Av. Huaylas 640, en Chorrillos, en una sala de exhibición techada permanente con estacionamiento para visitantes.","El Museo abre de martes a domingo, de 9 am a 7 pm. El personal habla inglés y se aceptan tarjetas, lo que lo hace cómodo para viajeros internacionales.","Para la mejor experiencia, reserva al menos dos horas: una para la colección y otra para el restaurante. Los tours privados y grupales pueden reservarse con anticipación para un recorrido más profundo y guiado.","Seas un apasionado de los autos o simplemente busques una de las cosas más originales por hacer en Lima, la colección premia a todo tipo de visitante."]},
 {id:'design-history',cat:{en:'Heritage',es:'Patrimonio'},read:6,date:'May 2026',
  title:{en:"120 Years of Design: From the Brass Era to Hypercars",es:"120 años de diseño: de la era del latón a los hiperdeportivos"},
  excerpt:{en:"How automotive design evolved from brass lamps and wooden wheels to carbon fiber.",es:"Cómo evolucionó el diseño del automóvil, del latón y la madera a la fibra de carbono."},
  body:["Few collections let you walk through more than a century of design in a single afternoon. From brass-era pioneers with tiller steering to mid-engined supercars, the story of the automobile is the story of human ingenuity.","Each decade solved new problems: the streamlined 1930s chased aerodynamics, the 1950s celebrated chrome and optimism, and the modern era pursues efficiency and downforce.","Seeing these eras side by side reveals surprising connections — the same pursuit of beauty and speed that shaped a 1930s Auburn also drives today's carbon-bodied Aston Martin.","At ARTECH, design history is not a textbook. It is something you can see, hear and almost touch."],
  bodyEs:["Pocas colecciones te permiten recorrer más de un siglo de diseño en una sola tarde. De los pioneros de la era del latón con dirección de timón a los superdeportivos de motor central, la historia del automóvil es la historia del ingenio humano.","Cada década resolvió nuevos problemas: los aerodinámicos años treinta persiguieron la eficiencia del aire, los cincuenta celebraron el cromo y el optimismo, y la era moderna busca eficiencia y carga aerodinámica.","Ver estas épocas una al lado de la otra revela conexiones sorprendentes: la misma búsqueda de belleza y velocidad que dio forma a un Auburn de los años treinta impulsa hoy a un Aston Martin de carrocería de carbono.","En ARTECH, la historia del diseño no es un libro de texto. Es algo que puedes ver, oír y casi tocar."]},
 {id:'private-tours',cat:{en:'Experiences',es:'Experiencias'},read:4,date:'Apr 2026',
  title:{en:"Private Tours and Experiences for Collectors and Families",es:"Tours privados y experiencias para coleccionistas y familias"},
  excerpt:{en:"Curated, one-on-one journeys through the collection — at your own pace.",es:"Recorridos curados y personalizados por la colección, a tu propio ritmo."},
  body:["Some visitors want to explore freely; others want the full story. ARTECH offers private and group experiences designed around your interests, whether that is Porsche, pre-war elegance or the world's oldest car.","A private guide brings each vehicle to life with the history, engineering and anecdotes that make a collection memorable — ideal for enthusiasts, families and corporate guests alike.","Experiences can be paired with the restaurant for a complete afternoon, and are available in English and Spanish.","It is a more personal way to experience the Museum, and a favorite for special occasions and visiting collectors."],
  bodyEs:["Algunos visitantes quieren explorar libremente; otros quieren la historia completa. ARTECH ofrece experiencias privadas y grupales diseñadas en torno a tus intereses, ya sea Porsche, la elegancia de preguerra o el auto más antiguo del mundo.","Un guía privado da vida a cada vehículo con la historia, la ingeniería y las anécdotas que hacen memorable una colección, ideal para entusiastas, familias e invitados corporativos.","Las experiencias pueden combinarse con el restaurante para una tarde completa, y están disponibles en inglés y español.","Es una forma más personal de vivir el Museo, y una de las favoritas para ocasiones especiales y coleccionistas de visita."]},
 {id:'chorrillos',cat:{en:'Travel',es:'Viajes'},read:4,date:'Apr 2026',
  title:{en:"Why Chorrillos Is Lima's Hidden Cultural Gem",es:"Por qué Chorrillos es la joya cultural escondida de Lima"},
  excerpt:{en:"Just south of Miraflores, this seaside district blends history, food and sea air.",es:"Al sur de Miraflores, este distrito costero mezcla historia, gastronomía y brisa marina."},
  body:["Chorrillos is one of Lima's oldest seaside districts, with cliffs, fishing traditions and a relaxed pace that feels a world away from the city center.","It is the perfect home for a museum like ARTECH: accessible, characterful and surrounded by great food and ocean views.","Visitors often pair a morning at the collection with a walk along the Costa Verde or fresh seafood by the water, making it an easy and rewarding day out.","For travelers looking beyond the usual tourist trail, Chorrillos offers a more authentic side of Lima — with world-class classic cars at its heart."],
  bodyEs:["Chorrillos es uno de los distritos costeros más antiguos de Lima, con acantilados, tradiciones de pesca y un ritmo relajado que se siente a un mundo de distancia del centro.","Es el hogar perfecto para un museo como ARTECH: accesible, con carácter y rodeado de buena comida y vistas al mar.","Los visitantes suelen combinar una mañana en la colección con un paseo por la Costa Verde o un fresco plato de mariscos junto al agua, convirtiéndolo en un día fácil y gratificante.","Para quienes buscan ir más allá del circuito turístico habitual, Chorrillos ofrece un lado más auténtico de Lima, con autos clásicos de clase mundial en su corazón."]}
];
function fechaBlog(d){
  if(lang!=='es') return d;
  const M={Jan:'Ene',Apr:'Abr',Aug:'Ago',Dec:'Dic'};   // el resto coincide en ambos idiomas
  return d.replace(/^[A-Za-z]{3}/, m => M[m] || m);
}
function renderBlog(){
  const host=document.getElementById('blogGrid'); if(!host) return;
  const L=(typeof lang!=='undefined'&&lang==='es')?'es':'en';
  const rl=(L==='es')?'min de lectura':'min read';
  host.innerHTML=BLOG.map(p=>`<a class="blog-card" href="#p-post/${encodeURIComponent(p.id)}" data-id="${p.id}"><div class="bc-top"><span class="bc-cat">${p.cat[L]}</span></div><div class="bc-body"><h3>${p.title[L]}</h3><p>${p.excerpt[L]}</p><div class="bc-meta"><span>${fechaBlog(p.date)}</span><span>${p.read} ${rl}</span></div></div></a>`).join('');
}
let currentPost=null;
function showPost(id){
  const p=BLOG.find(x=>x.id===id); if(!p) return; currentPost=id;
  const L=(typeof lang!=='undefined'&&lang==='es')?'es':'en';
  const set=(el,v)=>{const n=document.getElementById(el); if(n) n.textContent=v;};
  set('postCat',p.cat[L]); set('postTitle',p.title[L]);
  const rl=(L==='es')?'min de lectura':'min read';
  set('postMeta',`${fechaBlog(p.date)}  ·  ${p.read} ${rl}`);
  const paras=(L==='es'&&p.bodyEs)?p.bodyEs:p.body;
  const bd=document.getElementById('postBody'); if(bd) bd.innerHTML=paras.map(par=>`<p>${par}</p>`).join('');
  scrollTo(0,0);
}

// Explicit handoff; no data is marked as sent until a real service is connected.
document.getElementById('cform').addEventListener('submit', e => {
  e.preventDefault();
  const form=e.currentTarget;
  if(!form.reportValidity()) return;
  const data=new FormData(form);
  const message=[lang==='es'?'Hola ARTECH, quisiera hacer una consulta.':'Hi ARTECH, I would like to make an enquiry.',
    `${dict[lang].f_name}: ${data.get('name')}`,`${dict[lang].f_email}: ${data.get('email')}`,
    data.get('phone') ? `${dict[lang].f_phone}: ${data.get('phone')}` : '',
    `${dict[lang].f_subject}: ${data.get('subject')}`,String(data.get('message'))].filter(Boolean).join('\n');
  const link=document.createElement('a'); link.href=whatsappURL(message); link.target='_blank'; link.rel='noopener'; link.click();
  document.getElementById('contact-status').textContent=dict[lang].contact_ready;
});

function setImg(id,src){ const el=document.getElementById(id); if(!el) return; const box=el.parentElement, lbl=box&&box.querySelector('.ph-lbl'); if(src){ el.src=src; if(lbl) lbl.style.display='none'; } else { el.removeAttribute('src'); if(lbl) lbl.style.display=''; } }
let galTimer=null, galPaused=false;
function showVehicle(slug){
  const car=CARS.find(c=>c.slug===slug); if(!car) return;
  currentSlug=slug;
  const b='assets/cars/'+slug+'/';
  const es=(lang==='es');
  setImg('vhCover',b+'cover.jpg');
  document.getElementById('vhCover').alt = car.name;
  const disp=car.name||car.plate;
  const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=(v&&String(v).trim())||'';};
  set('vhName',disp);
  const sp0=((es && car.specs_es) ? car.specs_es : car.specs)||{};
  // hero meta: year · plate
  const mparts=[];
  if(car.year) mparts.push(car.year);
  if(realPlate(car.plate)) mparts.push((es?'Placa ':'Plate ')+car.plate);
  const metaWrap=document.getElementById('vhMetaWrap');
  if(metaWrap){ metaWrap.textContent=mparts.join('   ·   '); metaWrap.style.display=mparts.length?'':'none'; }
  // key stats tiles
  const keys=document.getElementById('vhKeys');
  if(keys){
    const K=[];
    if(car.year) K.push([es?'Año':'Year',car.year]);
    if(sp0.hp) K.push([es?'Potencia':'Power',sp0.hp]);
    if(sp0.vel) K.push([es?'Vel. máx.':'Top speed',sp0.vel]);
    if(sp0.trans) K.push([es?'Transmisión':'Transmission',sp0.trans]);
    keys.innerHTML=K.slice(0,4).map(k=>`<div class="vh-key"><span class="vk-v">${escapeHTML(k[1])}</span><span class="vk-l">${k[0]}</span></div>`).join('');
    keys.style.display=(K.length>=2)?'':'none';
  }
  // unified gallery (detail + view photos that exist)
  const sideWrap=document.getElementById('vhSideWrap'), sideImg=document.getElementById('vhSide');
  if(sideWrap && sideImg){
    if(car.side){ sideImg.src=b+'side.jpg'; sideImg.alt=disp; sideWrap.hidden=false; }
    else { sideImg.removeAttribute('src'); sideWrap.hidden=true; }
  }
  const gal=document.getElementById('vhGallery');
  if(gal){
    const shots=Array.isArray(car.shots)?car.shots:[];
    gal.innerHTML = shots.length
      ? shots.map((f,index)=>`<button type="button" class="vh-gitem" aria-label="${dict[lang].photo_open} ${index+1}"><img class="vh-slot" src="${b}${f}" alt="${escapeHTML(disp)} · ${index+1}" loading="lazy"><span class="vehicle-photo-caption">${String(index+1).padStart(2,'0')} / ${escapeHTML(disp)} <span aria-hidden="true">↗</span></span></button>`).join('')
      : '';   // espacios en blanco para fotos futuras
    clearInterval(galTimer);
  }
  // subtle description below the cover
  const dw=document.getElementById('vhDescWrap'), dEl=document.getElementById('vhDesc');
  const desc=(lang==='es' && car.desc_es) ? car.desc_es : car.desc;
  if(desc){ if(dEl) dEl.textContent=desc; if(dw) dw.hidden=false; }
  else if(dw) dw.hidden=true;
  // vehicle info — hide empty fields (no dashes)
  const setLi=(id,v)=>{const el=document.getElementById(id); if(!el) return; const li=el.closest('li'); const has=v&&String(v).trim(); if(has){ el.textContent=v; if(li) li.style.display=''; } else if(li) li.style.display='none';};
  const sp=sp0;
  setLi('vsBrand',car.brand); setLi('vsModel',car.model); setLi('vsYear',car.year);
  setLi('vsPlate', realPlate(car.plate)?car.plate:'');
  setLi('vsBody',sp.tipo); setLi('vsMotor',sp.motor); setLi('vsDisp',sp.cil); setLi('vsHp',sp.hp);
  setLi('vsTrans',sp.trans); setLi('vsBrakes',sp.frenos); setLi('vsSpeed',sp.vel);
  // hide info card if it has no data at all; hide specs card if empty
  const infoCard=document.getElementById('vhInfoCard');
  const infoHas=[car.brand,car.model,car.year,realPlate(car.plate)?car.plate:'',sp.tipo,sp.motor,sp.cil,sp.hp].some(x=>x&&String(x).trim());
  if(infoCard) infoCard.style.display=infoHas?'':'none';
  const specCard=document.getElementById('vhSpecCard');
  if(specCard) specCard.style.display=(sp.trans||sp.frenos||sp.vel)?'':'none';
  const strip=document.getElementById('vhStrip');
  if(strip){ const i=CARS.indexOf(car); let out='';
    for(let k=1;k<=4;k++){ const c=CARS[(i+k)%CARS.length]; const dn=c.name||c.plate;
      out+=`<a class="col-card vh-link" href="#p-vehicle/${encodeURIComponent(c.slug)}" data-slug="${c.slug}"><div class="ph"><img src="assets/cars/${c.slug}/thumb.jpg" alt="${escapeHTML(dn)}" loading="lazy"></div><div class="body"><h4>${escapeHTML(dn)}</h4></div></a>`; }
    strip.innerHTML=out; }
  window.ArtechEditorial?.renderVehicle(car);
  updatePageMetadata();
}
// filters (category pills + live search by plate)
function wireFilters(){
  const pills=[...document.querySelectorAll('.pf')];
  const brandSel=document.getElementById('brandSel');
  const search=document.getElementById('carSearch');
  const noRes=document.getElementById('noResults');
  const grid=document.getElementById('carGrid');
  const pager=document.getElementById('pcPager');
  if(brandSel) {
    const selected = brandSel.value;
    brandSel.innerHTML = `<option value="">${dict[lang].flt_brands}</option>`
      + [...new Set(CARS.map(car=>car.brand).filter(Boolean))].sort().map(brand=>`<option value="${escapeHTML(brand)}">${escapeHTML(brand)}</option>`).join('');
    brandSel.value = selected;
  }
  if(grid.dataset.wired){window._pcApply();return;}
  let cat='all', page=1; const perPage=12;
  function filtered(){
    const q=(search&&search.value.trim().toLowerCase())||'';
    return [...grid.querySelectorAll('.c-item')].filter(it=>{
      const okCat = cat==='all' || it.dataset.cat===cat;
      const okQ = !q || it.dataset.name.includes(q);
      const okBrand = !brandSel.value || it.dataset.brand === brandSel.value;
      return okCat && okQ && okBrand;
    });
  }
  function pageList(cur,total){
    const out=[]; if(total<=7){for(let i=1;i<=total;i++)out.push(i);return out;}
    out.push(1); let s=Math.max(2,cur-1),e=Math.min(total-1,cur+1);
    if(cur<=3){s=2;e=4;} if(cur>=total-2){s=total-3;e=total-1;}
    if(s>2)out.push('…'); for(let i=s;i<=e;i++)out.push(i); if(e<total-1)out.push('…'); out.push(total); return out;
  }
  function renderPager(pages){
    if(!pager) return;
    if(pages<=1){ pager.innerHTML=''; return; }
    let h=`<button class="pg-btn nav" data-pg="prev"${page===1?' disabled':''} aria-label="${dict[lang].previous}">‹</button>`;
    pageList(page,pages).forEach(n=>{ h+= n==='…' ? `<span class="pg-dots">…</span>` : `<button class="pg-btn${n===page?' active':''}" data-pg="${n}"${n===page?' aria-current="page"':''}>${n}</button>`; });
    h+=`<button class="pg-btn nav" data-pg="next"${page===pages?' disabled':''} aria-label="${dict[lang].next}">›</button>`;
    pager.innerHTML=h;
  }
  function apply(){
    const list=filtered();
    const pages=Math.max(1,Math.ceil(list.length/perPage));
    if(page>pages) page=pages;
    grid.querySelectorAll('.c-item').forEach(it=>it.style.display='none');
    const start=(page-1)*perPage;
    list.slice(start,start+perPage).forEach(it=>it.style.display='');
    if(noRes) noRes.hidden = list.length>0;
    renderPager(pages);
    window.ArtechEditorial?.updateResults(list.length,CARS.length,cat!=='all'||!!brandSel.value||!!search?.value.trim());
    pills.forEach(p=>p.setAttribute('aria-pressed',String(p.dataset.cat===cat)));
  }
  window._pcApply=apply;
  if(!grid.dataset.wired) {
  grid.dataset.wired='true';
  document.getElementById('collectionClear')?.addEventListener('click',()=>{cat='all';page=1;brandSel.value='';search.value='';pills.forEach(p=>p.classList.toggle('active',p.dataset.cat==='all'));apply();});
  brandSel.addEventListener('change',()=>{ page=1; apply(); });
  pills.forEach(p=>p.addEventListener('click',()=>{ cat=p.dataset.cat; page=1; pills.forEach(x=>x.classList.toggle('active',x===p)); apply(); }));
  if(search) search.addEventListener('input',()=>{ page=1; apply(); });
  if(pager) pager.addEventListener('click',e=>{
    const b=e.target.closest('.pg-btn'); if(!b||b.disabled) return;
    const pages=Math.max(1,Math.ceil(filtered().length/perPage));
    const v=b.dataset.pg;
    if(v==='prev') page=Math.max(1,page-1); else if(v==='next') page=Math.min(pages,page+1); else page=parseInt(v,10);
    apply();
    const zone=document.querySelector('.pc-grid-zone'); if(zone) zone.scrollIntoView({behavior:'smooth',block:'start'});
  });
  // 1 / 2 column layout toggle
  const layBtns=[...document.querySelectorAll('.pc-lay')];
  layBtns.forEach(b=>b.addEventListener('click',()=>{
    const c=b.dataset.cols;
    grid.classList.remove('cols-1','cols-2','cols-4'); grid.classList.add('cols-'+c);
    layBtns.forEach(x=>x.classList.toggle('active',x===b));
    layBtns.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  }));
  }
  apply();
}
function updateCatalogueStatus() {
  const node=document.getElementById('catalogue-status');
  const message = carsStatus==='error' ? 'catalogue_error' : carsStatus==='loading' ? 'catalogue_loading' : !CARS.length ? 'catalogue_empty' : null;
  node.textContent = message ? dict[lang][message] : '';
  node.hidden = !message;
  document.getElementById('catalogue-retry').hidden = carsStatus!=='error';
  document.getElementById('carGrid').setAttribute('aria-busy',String(carsStatus==='loading'));
}
window.updateCatalogueStatus = updateCatalogueStatus;
async function loadCars() {
  carsStatus='loading'; updateCatalogueStatus();
  try {
    const response=await fetch('assets/cars.json');
    if(!response.ok) throw new Error('Catalogue request failed');
    CARS=normaliseCars(await response.json());
    CARS.sort((a,b)=>(a.featured_order||100)-(b.featured_order||100));
    carsStatus='ready';
    renderCollections(); wireFilters();
    const brands=new Set(CARS.map(car=>car.brand).filter(Boolean));
    const years=CARS.map(car=>parseInt(car.year,10)).filter(Number.isFinite);
    document.getElementById('statCars').textContent=CARS.length;
    document.getElementById('statBrands').textContent=brands.size;
    document.getElementById('statYears').textContent=years.length ? Math.max(...years)-Math.min(...years) : '—';
  } catch(_) { carsStatus='error'; CARS=[]; }
  updateCatalogueStatus(); apply(lang); route();
}
document.getElementById('catalogue-retry').addEventListener('click',loadCars);
loadCars();

// Accessible photo dialog, including keyboard activation and focus restoration.
(function() {
  const lb=document.getElementById('lightbox'),img=document.getElementById('lbImg'),close=lb.querySelector('button');
  let opener=null,oldOverflow='',fadeTimer,photos=[],photoIndex=0;
  const previous=lb.querySelector('.lb-prev'),next=lb.querySelector('.lb-next'),counter=document.getElementById('lbCount');
  function changePhoto(index){photoIndex=(index+photos.length)%photos.length;const photo=photos[photoIndex];if(!photo)return;img.src=photo.currentSrc||photo.src;img.alt=photo.alt;counter.textContent=`${photoIndex+1} / ${photos.length}`;previous.hidden=next.hidden=photos.length<2;}
  previous.addEventListener('click',()=>changePhoto(photoIndex-1));next.addEventListener('click',()=>changePhoto(photoIndex+1));
  function closePhoto() {
    if(!lb.classList.contains('show'))return;
    lb.classList.remove('show');document.documentElement.style.overflow=oldOverflow;
    document.getElementById('main-content').inert=false;document.getElementById('header').inert=false;document.querySelector('footer').inert=false;
    document.querySelectorAll('main>section').forEach(section=>section.inert=false);
    if(opener?.isConnected)opener.focus({preventScroll:true});
    fadeTimer=setTimeout(()=>img.removeAttribute('src'),300);
  }
  function openPhoto(target,focusTarget=target) {
    const photo=target.matches('img')?target:target.querySelector('img');if(!photo?.getAttribute('src'))return;
    clearTimeout(fadeTimer);opener=focusTarget;oldOverflow=document.documentElement.style.overflow;
    photos=[...document.querySelectorAll('#vhCover,#vhSideWrap:not([hidden]) img,#vhGallery img')].filter(image=>image.getAttribute('src'));photoIndex=Math.max(0,photos.indexOf(photo));changePhoto(photoIndex);
    lb.classList.add('show');document.documentElement.style.overflow='hidden';
    // main uses display:contents; the dialog lives inside it, so inert only sibling sections.
    document.getElementById('header').inert=true;document.querySelector('footer').inert=true;
    document.querySelectorAll('main>section').forEach(section=>section.inert=true);
    close.focus();
  }
  document.addEventListener('click',e=>{
    const target=e.target.closest('#page-vehicle .vh-gitem,#vhSide,#vhCover');
    if(target){e.preventDefault();openPhoto(target,target);return;}
    if(e.target===lb||e.target===img||e.target===close)closePhoto();
  });
  document.addEventListener('keydown',e=>{
    if(lb.classList.contains('show')) {
      if(e.key==='Escape'){e.preventDefault();closePhoto();}
      if(e.key==='ArrowLeft'){e.preventDefault();changePhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();changePhoto(photoIndex+1);}
      if(e.key==='Tab'){const buttons=[...lb.querySelectorAll('button')].filter(button=>!button.hidden&&!button.disabled);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    }else if((e.key==='Enter'||e.key===' ')&&e.target.matches('#vhSide,#vhCover')){e.preventDefault();openPhoto(e.target);}
  });
  img.addEventListener('error',()=>{closePhoto();window.__toast(dict[lang].catalogue_error);});
  addEventListener('hashchange',closePhoto);
})();
// toast notification
let toastTimer;
window.__toast=function(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),4200);
};
apply(lang);
route();

document.querySelector('.skip-link').addEventListener('click',event=>{
  event.preventDefault();
  const heading=document.querySelector('.subpage.active h1,.subpage.active h2')||document.querySelector('#top h1');
  if(heading){window.ArtechMotion?.reveal(heading);heading.tabIndex=-1;heading.focus();}
});

// Intro and manual video playback are managed by v3-shell.js.
