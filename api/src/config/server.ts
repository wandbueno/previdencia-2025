// Configurações relacionadas ao servidor
export const serverConfig = {
  // URL base do servidor - configura para desenvolvimento, pode ser ajustada para produção
  baseUrl: process.env.SERVER_BASE_URL || 'http://localhost:3000',
  
  // Porta onde o servidor está rodando
  port: process.env.PORT || 3000,
  
  // Caminhos para recursos estáticos
  staticPaths: {
    uploads: '/uploads',
    backups: '/backups-files'
  },
  
  // Método auxiliar para construir URLs completas
  getFullUrl(path: string): string {
    // Garante que o path comece com '/' se não começar
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${formattedPath}`;
  },
  
  // Método para construir URLs para recursos estáticos
  getStaticUrl(type: 'uploads' | 'backups', filename: string): string {
    const basePath = this.staticPaths[type];
    // Remove barras extras no início do nome do arquivo
    const formattedFilename = filename.startsWith('/') ? filename.substring(1) : filename;
    return this.getFullUrl(`${basePath}/${formattedFilename}`);
  }
};
