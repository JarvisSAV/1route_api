export const typeDefs = `#graphql
  type Query {
    currentNumber: Int
    ping: String
    me: User
    paquetesXchofer: [Paquete]
    listChoferes: [User]
    listUnidades: [Unidad]
    listRutas: [Ruta]
    allPaquetes: [Paquete]
  },

  type Mutation {
    incrementNumber: Int
    
    paqueteid(
      id: String!
    ): Paquete

    addUser(
      dni: String!, 
      password:String!,
      nombre: String!,
      apellido: String!,
      telefono: Float!,
      tipo: String
    ): User!

    createPaquete(
      descripcion: String!,
      origen: String!,
      destino: String!,
      fecha: String!,
      latitud: Float!,
      longitud: Float!,
      altitud: Float!,
      estado: String
    ): Paquete!

    login(
      dni: String!,
      password: String!
    ): Token!
    
    loginAdmin(
      dni: String!,
      password: String!
    ): Token!
    
    updatePaquete(
      id: String!,
      estado: String!
    ): Paquete!
    realtimeUbicacion(
      latitud: Float!,
      longitud: Float!,
      altitud: Float
    ): Coordenadas!
  },

  type User {
    _id: ID!
    dni: String
    password: String
    nombre: String
    apellido: String
    telefono: Float
    estado: Boolean
    tipo: String
    ubicacion: Coordenadas
  }

  type Token {
    value: String
  }

  type Ruta {
    _id: ID!
    fecha: String
    unidad: Unidad
    chofer: User
    paquetes: [Paquete]
    puntos_entrega: [PuntoEntrega]
  }

  type PuntoEntrega {
    _id: ID!
    direccion: String
  }

  type Paquete {
    _id: ID!
    descripcion: String
    origen: String
    destino: String
    fecha: String
    coordenadas: Coordenadas
    estado: String
    ruta: Ruta
    telefono: Float
    nombre: String
  }

  type Coordenadas {
    latitud: Float
    longitud: Float
  }

  type Unidad {
    _id: ID!
    placa: String
    marca: String
    modelo: String
    capacidad: Float
    estado: String
  }

  type Subscription {
    numberIncremented: Int
    paqueteUpdated: Paquete
  }
`